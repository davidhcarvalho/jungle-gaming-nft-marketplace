# Local Validation Runner

O runner executa verificações Playwright no terminal host, fora do sandbox, usando o mesmo checkout. É uma ferramenta local de workflow: não é importada pela aplicação e não altera o runtime ou o build.

## Iniciar no host

Na raiz do repositório, inicie uma única instância:

```bash
./scripts/ai-local-runner.sh
```

Ela seleciona Node `24.22.1` por mise, define `PLAYWRIGHT_BROWSERS_PATH` para `.cache/ms-playwright`, mostra que está pronta e aguarda pedidos com polling de um segundo. Não inicie o script em background a partir do sandbox.

O diretório `.ai/runner/` é criado pelo runner. Um lock de diretório impede duas instâncias simultâneas. Se uma interrupção abrupta deixar `request.processing` ou o lock para trás, inspecione o estado antes de removê-lo; o script recusa iniciar sobre um request processando antigo para não repetir uma execução parcialmente concluída.

## Solicitar uma validação

Escreva exatamente um target permitido em `.ai/runner/request`:

```bash
printf 'spec:auth-favorites\n' > .ai/runner/request
```

Targets aceitos:

- `static`: typecheck, lint, build e build com mocks.
- `e2e`: `npm run test:e2e`.
- `full`: os quatro gates estáticos e depois a suíte Playwright completa. Um gate falho não impede os seguintes.
- `spec:<nome>`: executa `npx playwright test tests/<nome>.spec.ts --workers=1`. O nome aceita somente letras, dígitos, `_` e `-`, e o arquivo precisa existir.

Os comandos são definidos no script por whitelist. O conteúdo recebido não é avaliado nem passado a um shell; entradas desconhecidas, multilinha ou spec inválida são rejeitadas.

## Acompanhar e ler o resultado

O runner move atomicamente `request` para `request.processing` antes de iniciar o trabalho. Assim que consome o pedido, publica `latest.md` com status `RUNNING` e trunca `latest.log` para a execução nova. Ao terminar, grava o resultado final e remove `request.processing`.

O resumo está em `.ai/runner/latest.md`; stdout e stderr completos estão em `.ai/runner/latest.log`. O resumo informa request/target, ID único do request, status, exit code, início/fim, duração e comandos/gates individuais. O processo permanece ativo após PASS ou FAIL e volta a aguardar.

Não confunda um resultado antigo com o pedido atual. Antes de escrever o request, anote o campo `Request ID` atual em `latest.md` (ou anote que ainda não existe). Aguarde o runner consumir o request e depois aguarde `latest.md` mostrar o target solicitado com `Request ID` diferente e status terminal (`PASS` ou `FAIL`). Isso evita confusão mesmo quando dois requests começam no mesmo segundo. Se o status for `FAIL`, leia o log bruto e os traces/screenshots Playwright correspondentes.

Há um único slot de request aguardando. Enquanto um target executa, um request novo pode permanecer em `request` para execução sequencial seguinte. Não sobrescreva esse arquivo nem envie outro pedido enquanto ele existir; isso evita perder trabalho. Não são executados dois targets simultaneamente.

## Instruções operacionais para agentes

Quando a validação de browser no sandbox falhar com `listen EPERM`:

1. Não peça imediatamente ao usuário para executar Playwright manualmente.
2. Verifique se o runner está disponível, por exemplo lendo `.ai/runner/runner.lock/pid` e observando se o processo host permanece ativo.
3. Anote o `Started` anterior em `.ai/runner/latest.md`.
4. Crie o request apropriado, por exemplo `printf 'spec:auth-favorites\n' > .ai/runner/request`.
5. Aguarde o runner consumir o request e publicar um resultado com `Started` novo.
6. Leia `.ai/runner/latest.md`; se falhar, leia `.ai/runner/latest.log`, traces e screenshots.
7. Corrija a implementação/teste e solicite novamente, serialmente.
8. Antes de declarar PASS de um lote, solicite `full` e aguarde um resultado novo.

Se o runner não estiver ativo, informe que ele precisa ser iniciado uma única vez pelo comando da seção “Iniciar no host”. Não trate um `latest.md` anterior como resultado de um pedido novo.

## Arquivos transitórios

O `.gitignore` exclui somente request em trânsito, lock temporário e os dois resultados `latest.*`. O script `scripts/ai-local-runner.sh` e este protocolo são versionáveis.
