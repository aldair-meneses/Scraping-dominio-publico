const puppeteer = require('puppeteer');

const url = "http://www.dominiopublico.gov.br/pesquisa/ResultadoPesquisaObraForm.do?first=3000&skip=0&ds_titulo=&co_autor=&no_autor=&co_categoria=2&pagina=1&select_action=Submit&co_midia=2&co_obra=&co_idioma=1&colunaOrdenar=NU_PAGE_HITS&ordem=asc";
let globalData;

(async () => {

      const browser = await puppeteer.launch({
        headless: true,
        });

      const page = await browser.newPage();

      await page.goto(url);
      const result = await page.evaluate(() => {
        const table = document.querySelector("table#res").childNodes[3];
        const tablelength = table.childElementCount;
        const data  = [];
    
        for(let line = 0; line < tablelength; line++) {
    
          let actualLine = table.children[line];
          
          //Pega o título do livro.
          let bookTitle = actualLine.childNodes[5].innerText;
          
          //Pega o link para a página do arquivo.
          
          let bookLink = actualLine?.childNodes[5]?.children[0]?.href ?? "";
          
          //Pega o nome do autor.
          let authorName = actualLine.childNodes[7].innerText;
      
          //Pega o nome da fonte.
          let bookFont = actualLine.childNodes[9].innerText;
      
          //Pega o tipo de arquivo.
          let fileType = actualLine.childNodes[11].innerText;
      
          //Pega o tamanho do arquivo.
          let fileSize = actualLine.childNodes[13].innerText;
      
          data.push(
            {
              "cct_status": "publish",
              'link': bookLink,
              "titulo": bookTitle,
              "autor": authorName,
              "fonte": bookFont,
              "tipo_de_arquivo": fileType,
              "tamanho_do_arquivo": fileSize,
              "capa": "https://aldair.aztecweb.net/wp-content/uploads/2022/11/cover_fallback.png"
            });
        };
        return data;
      });
    globalData = result;
    console.log(globalData);
    // await browser.close();
    // console.log(result)
    
  })();

