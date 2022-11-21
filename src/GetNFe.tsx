import Nullstack, { NullstackClientContext, NullstackServerContext } from 'nullstack';
import { DistribuicaoDFe } from 'node-mde';
import { readFileSync } from 'fs';
import { Notify } from 'notiflix';

type TypeAmbiente = '1'| '2'
type TypeGetSingleNFe = {
  status: 'success' | 'error' | null;
  chave?: string;
  error?: string;
  xml?: string;
}

interface GetNFeProps {
  chave?: string
}

interface GetNFe {
  getSingleNFe({chave}: GetNFeProps): Promise<TypeGetSingleNFe>
}
class GetNFe extends Nullstack<GetNFeProps> {
  chave: string = '';
  loading: boolean = false;  
  response: TypeGetSingleNFe = { status : null}

  async saveXml() {
    if(this.chave === '') {
      Notify.warning('Digite a Chave da NF-e');
      return
    }
    if (this.chave.length !== 44) {
      Notify.warning('A Chave da NF-e deve conter 44 Caracteres! Confira!');
      return
    }
    this.loading = true
    this.response = await this.getSingleNFe({chave: this.chave});
    if(this.response.status === 'success') {
      const encodedUri = encodeURIComponent(this.response.xml);
      const link = document.createElement("a");
      link.setAttribute("href", 'data:text/plain;charset=utf-8,' + encodedUri);
      link.setAttribute("download", `${this.response.chave}.xml`);
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
      this.chave = ''
      Notify.success('Nota Encontrada....')
    } else {
      Notify.failure(`Erro ao Baixar NFe <br/>   ${this.response.error}`)
    }
    this.loading = false;
  }

  static async getSingleNFe({ chave, secrets }: NullstackServerContext<GetNFeProps>){
    const distribuicao = new DistribuicaoDFe({
      pfx: readFileSync(`./cert/${secrets.certificado}`),
      passphrase: secrets.pass as string,
      cnpj: secrets.cnpj as string,
      cUFAutor: secrets.uf as string,
      tpAmb: secrets.ambiente as TypeAmbiente,
    })
    const consulta = await distribuicao.consultaChNFe(chave)
    if (consulta.error) {
      return { status: 'error', chave, error: consulta.error  };
    } else if (consulta.data.docZip.length < 1 ) {
      return { status: 'error', chave, error:  consulta.data.xMotivo };
    }
    return {
      status: 'success',
      chave,
      xml: consulta.data.docZip[0].xml
    }
  }

  render({}: NullstackClientContext<GetNFeProps>) {
    return <div class='grid justify-items-center w-screen'>
      <div class='w-4/12'>
        <input type="number" bind={this.chave} class='text-black p-4 w-11/12 placeholder:text-gray-600' placeholder='Digite a Chave da NFe'/>
        <span class='ml-4'>{this.chave.length}</span>
      </div>
      <button class='bg-emerald-700 p-4 mt-4 ' onclick={this.saveXml} disabled={this.loading}>
        {this.loading && 
          <svg class="animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>}
        {!this.loading && 
          <svg class="fill-white mb-2" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 499.93">
            <path fill-rule="nonzero" d="M114.51 278.73c-4.37-4.2-4.55-11.2-.38-15.62a10.862 10.862 0 0 1 15.46-.39l115.34 111.34V11.07C244.93 4.95 249.88 0 256 0c6.11 0 11.06 4.95 11.06 11.07v362.42L378.1 262.85c4.3-4.27 11.23-4.21 15.46.13 4.23 4.35 4.17 11.35-.13 15.62L264.71 406.85a11.015 11.015 0 0 1-8.71 4.25c-3.45 0-6.52-1.57-8.56-4.04L114.51 278.73zm375.35 110.71c0-6.11 4.96-11.07 11.07-11.07S512 383.33 512 389.44v99.42c0 6.12-4.96 11.07-11.07 11.07H11.07C4.95 499.93 0 494.98 0 488.86v-99.42c0-6.11 4.95-11.07 11.07-11.07 6.11 0 11.07 4.96 11.07 11.07v88.36h467.72v-88.36z"/>
          </svg>
        }
        Baixar
      </button>
    </div>;
  }
}

export default GetNFe;
