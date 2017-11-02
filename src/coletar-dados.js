const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    var pages = [];
    const page = await browser.newPage();
    pages.push(page);
    await page.goto('http://www.imoveiscatedral.com.br/imoveis/a-venda/apartamento+casa+cobertura+chacara/santa-cruz-do-sul');
    var paginas = await page.evaluate(() => {
        return parseInt($('.pagination-cell')[0].innerText.trim().replace(/1\sde\s/gi, ''));
    });

    var imoveis = await page.evaluate(getInterpretador());
    for(i = 2; i <= paginas; i++) {
        console.log('Processando pagina ' + i);
        await page.goto('http://www.imoveiscatedral.com.br/imoveis/a-venda/apartamento+casa+cobertura+chacara/santa-cruz-do-sul?pagina=' + i);
        let tmpImoveis = await page.evaluate(getInterpretador());
        for(ie in tmpImoveis) {
            imoveis.push(ie);
        }
    }

    console.log(imoveis.length);

    await browser.close();
})();

function getInterpretador() {
    return () => {
        var imoveis = [];
        for (x = 0; x < 12; x++) {
            if ($('#b1-c3-c' + x).length === 0) {
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