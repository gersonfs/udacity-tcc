const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Iniciando browser');
    const browser = await puppeteer.launch();

    console.log('Criando nova página');
    const page = await browser.newPage();

    console.log('Acessando a página 1 do primeiro site');
    await page.goto('http://www.imoveiscatedral.com.br/imoveis/a-venda/casa/santa-cruz-do-sul');

    console.log('Extraindo quantidade de páginas');
    var paginas = await page.evaluate(() => {
        return parseInt($('.pagination-cell')[0].innerText.trim().replace(/1\sde\s/gi, ''));
    });

    console.log(paginas + ' páginas encontradas!');

    console.log('Processando página 1');
    var imoveis = await page.evaluate(getInterpretador());

    for(i = 2; i <= paginas; i++) {
        console.log('Processando pagina ' + i);
        await page.goto('http://www.imoveiscatedral.com.br/imoveis/a-venda/casa/santa-cruz-do-sul?pagina=' + i);
        let tmpImoveis = await page.evaluate(getInterpretador());
        tmpImoveis.forEach(function(i) {
            imoveis.push(i);
        });
    }

    console.log(imoveis.length + ' imóveis encontrados!');

    const fd = fs.openSync('imoveis.csv', 'w+');
    let header = Object.keys(imoveis[0]).join(";") + "\r\n";
    fs.writeSync(fd, header);
    imoveis.forEach(function(imovel) {
        let linha = Object.values(imovel).join(";") + "\r\n";
        console.log(imovel);
        fs.writeSync(fd, linha);
    }, this);

    fs.closeSync(fd);

    await browser.close();
})();

function getInterpretador() {
    return () => {
        let imoveis = [];
        for (x = 0; x < 12; x++) {
            if ($('#b1-c3-c' + x).length === 0) {
                console.log('entrando no break')
                break;
            }

            let valor = $('#b1-c3-c' + x + ' .h-money.location')[0].innerText;
            let bairro = $('#b1-c3-c' + x + ' h4.card-title')[0].innerText;
            let obs = null;
            if($('#b1-c3-c' + x + ' .info-right.text-xs-right').length > 0) {
                obs = $('#b1-c3-c' + x + ' .info-right.text-xs-right p')[0].innerText.trim();
            }
            var tipo = null;
            if($('#b1-c3-c' + x + ' .card-block.text-xs-center > p').length > 0) {
                tipo = $('#b1-c3-c' + x + ' .card-block.text-xs-center > p')[0].innerText;
            }
            var dormitorios = null;
            var banheiros = null;
            var vagasGaragem = null;
            var metragem = null;
            var codigo = $('#b1-c3-c' + x + ' .property_full_reference.pull-right')[0].innerText

            $('#b1-c3-c'+ x +' div.values > div p').each((i,v) => {
                let p = $(v)[0].innerText.split("\n");
                let nome = p[1];
                let valor = p[0];

                switch (nome) {
                    case 'm²':
                        metragem = valor;    
                        break;
                
                    case 'vaga':
                        vagasGaragem = valor;    
                        break;

                    case 'dorms':
                        dormitorios = valor;    
                        break;

                    case 'banheiro':
                        banheiros = valor;    
                        break;
                }
            });

            var imovel = {
                valor: valor,
                bairro: bairro,
                obs: obs,
                tipo: tipo,
                dormitorios: dormitorios,
                banheiros: banheiros,
                vagasGaragem: vagasGaragem,
                metragem: metragem,
                codigo: codigo
            };
            imoveis.push(imovel);
        }

        return imoveis;
    };
}