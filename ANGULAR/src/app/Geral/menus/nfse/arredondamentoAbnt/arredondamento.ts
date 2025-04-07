export function arredondarABNT(valor: number): number {
    const multiplicador = 100;
    const valorX1000 = valor * 1000;
    const inteiro = Math.floor(valorX1000 / 10);
    const proximo = Math.floor(valorX1000 % 10);
  
    const digitoFinal = inteiro % 10;
    const anterior = Math.floor(inteiro / 10);
  
    if (proximo < 5) {
      return anterior / multiplicador;
    } else if (proximo > 5) {
      return (anterior + 1) / multiplicador;
    } else {
      // Quando o próximo é 5
      if (digitoFinal !== 0) {
        return (anterior + 1) / multiplicador;
      } else {
        // arredonda para par mais próximo
        return (anterior % 2 === 0 ? anterior : anterior + 1) / multiplicador;
      }
    }
  }
  