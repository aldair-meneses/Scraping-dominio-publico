const fs = require('fs');

const url = "https://aldair.aztecweb.net/wp-json/jet-cct/livros/";

const getAndDelete = ()=> {
    fetch(url, {
        method: "GET",
        headers: {
            Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString('base64'),
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then((data) => {
        fs.writeFileSync('books.json',JSON.stringify(data, null, 2), err =>{
            if(err) throw err;
            console.log('saved!');
        })
    let rawData = fs.readFileSync('books.json');
    let parseData = JSON.parse(rawData);
    parseData.map(item => {
        const url_livro = `https://aldair.aztecweb.net/wp-json/jet-cct/livros/${item['_ID']}`
        fetch(url_livro, {
            method: 'DELETE',
            headers: {
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString('base64'),
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(item)
        })
        .then(res => res.json())
        .then(data => {
            console.log("Foi excluido com sucesso!", data);
        })
        .catch(e => {
            console.err("Ocorreu um erro na tentativa de exclusão:", e);
        })
    })
})
}
getAndDelete()
