require('dotenv').config();
const auth = `${process.env.USERNAME}:${process.env.PASSWORD}`;

const puppeteer = require('puppeteer');
const fs = require('fs')

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
          let bookTitle = actualLine?.childNodes[5]?.innerText ?? "";
          
          //Pega o link para a página do arquivo.
          
          let bookLink = actualLine?.childNodes[5]?.children[0]?.href ?? "";
          
          //Pega o nome do autor.
          let authorName = actualLine?.childNodes[7]?.innerText ?? "";
      
          //Pega o nome da fonte.
          let bookFont = actualLine?.childNodes[9]?.innerText ?? "";
      
          //Pega o tipo de arquivo.
          let fileType = actualLine?.childNodes[11]?.innerText ?? "";
      
          //Pega o tamanho do arquivo.
          let fileSize = actualLine?.childNodes[13]?.innerText ?? "";

          let verifyProps = [bookTitle, bookLink, bookFont, authorName, fileSize, fileType];

          if (verifyProps.every(value => { return value != ""; })) {
            data.push(
              {
                "_ID": line.toString(),
                'link': bookLink,
                "titulo": bookTitle,
                "autor": authorName,
                "fonte": bookFont,
                "tipo_de_arquivo": fileType,
                "tamanho_de_arquivo": fileSize,
                "capa": "https://aldair.aztecweb.net/wp-content/uploads/2022/11/cover_fallback.png"
              });
          };
         
        };
        return data;
      });
    globalData = result;
    let json = JSON.stringify(globalData, null, 1);
  
    fs.writeFile('data.json', json, (err) => {
      if(err) throw err;
      console.log('saved!');
    });
    
    await browser.close();
    
    console.log("Dando inicio as postagens");
    getAndPost();
  })();

const getAndPost= async()=> {
  const data = fs.readFileSync('data.json');
  const url_dominio = "https://aldair.aztecweb.net/wp-json/jet-cct/livros/"
  const parseData = JSON.parse(data);
  
  await Promise.all(parseData.map(async book => {
    fetch(`${url_dominio}${parseInt(book._ID)}`, {
      method: 'POST',
      headers: {
        Authorization: "Basic " + Buffer.from(auth).toString('base64'),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book)
    }).then(res => res.json())
    .then(data => console.log("Sucesso:", data))
    .catch(e => {
      console.error("A requisição falhou:", e)
    })
  })
)}
