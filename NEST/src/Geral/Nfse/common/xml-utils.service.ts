import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class XmlUtilsService {
  /**
   * Gera um XML preenchendo um template com os dados fornecidos.
   * @param templateName Nome do arquivo de template (sem extensão .xml)
   * @param dados Dados que serão inseridos no template
   * @returns XML preenchido como string
   */
  async gerarXml(templateName: string, dados: any): Promise<string> {
    // Caminho do template XML
    const templatePath = path.join(process.cwd(), `src/Geral/Nfse/templates/${templateName}.xml`);

    // Carregar o conteúdo do template
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Compilar o template usando handlebars
    const compiledTemplate = handlebars.compile(template);

    // Substituir os placeholders pelos dados fornecidos
    return compiledTemplate(dados);
  }
}
