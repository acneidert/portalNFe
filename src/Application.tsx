import Nullstack, { NullstackClientContext, NullstackNode } from 'nullstack';
import '../tailwind.css';
import GetNFe from './GetNFe';

declare function Head(): NullstackNode

class Application extends Nullstack {

  prepare({ page }: NullstackClientContext) {
    page.locale = 'pt-BR';
  }

  renderHead() {
    return (
      <head>
        <link
          href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Crete+Round&family=Roboto&display=swap"
          rel="stylesheet" />
      </head>
    )
  }

  render() {
    return (
      <body class="bg-gray-900 text-white font-roboto flex h-screen w-screen justify-center items-center">
        <GetNFe />
      </body>
    )
  }

}

export default Application;