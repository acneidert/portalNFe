import Nullstack, { NullstackClientContext, NullstackServerContext } from 'nullstack';
import fetch, { Headers, RequestInit } from 'node-fetch';
import { Notify } from 'notiflix';
import { NFe } from './parseNfe';

type TypeGetSingleNFe = {
  status: 'success' | 'error' | null;
  chave?: string;
  error?: string;
  xml?: string;
}

interface GetNFeSerproProps {
  chave?: string
}

interface GetNFeSerpro {
  getSingleNFe({chave}: GetNFeSerproProps): Promise<TypeGetSingleNFe>
}

const ERRORS = {
  400: "O número da chave informada não é válido.",
  404: "Não existe NFe com o número da chave informado.",
  406: "O formato do arquivo de saída deve ser Json/Xml.",
  500: "Erro interno do servidor."
}

class GetNFeSerpro extends Nullstack<GetNFeSerproProps> {
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

  static async getSingleNFe({ chave, secrets }: NullstackServerContext<GetNFeSerproProps>){
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", `Basic ${btoa(secrets.serprokey + ':'+ secrets.serprosecret)}`);

      const urlencoded = new URLSearchParams();
      urlencoded.append("grant_type", "client_credentials");

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
      };

      const token: {access_token: string} = await (await fetch("https://gateway.apiserpro.serpro.gov.br/token", requestOptions)).json() as {access_token: string}
      const xmlHeader = new Headers();
      xmlHeader.append("Accept", "application/json");
      xmlHeader.append("Authorization", `Bearer ${token.access_token}`);

      var requestXmlOptions: RequestInit = {
        method: 'GET',
        headers: xmlHeader,
        redirect: 'follow'
      };

      const xml = await fetch(`https://gateway.apiserpro.serpro.gov.br/consulta-nfe-df/api/v1/nfe/${chave}`, requestXmlOptions)
      if(xml.status === 200) {
        return {
          status: 'success',
          chave,
          xml: NFe.parseFromJson(JSON.parse(await xml.text()))  ,
        }
      } else {
        return { status: 'error', chave, error: ERRORS[xml.status] };
      }
    } catch (error) {
      console.error(error);
      return { status: 'error', chave, error };
    }
    
    
  }

  render({}: NullstackClientContext<GetNFeSerproProps>) {
    return <div class='grid justify-items-center w-screen'>
      <h1 class='p-4 text-2xl'>Esta Consulta é Paga! Use somente se Necessário!</h1>
      <div class='w-4/12'>
        <input type="number" bind={this.chave} class='text-black p-4 w-11/12 placeholder:text-gray-600' placeholder='Digite a Chave da NFe'/>
        <span class='ml-4'>{this.chave.length}</span>
      </div>
      <div class='flex flex-row gap-4'>
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
        <a href='/' class='bg-sky-700 p-4 mt-4 flex items-center'>Voltar</a>
      </div>
    </div>;
  }
}

export default GetNFeSerpro;
