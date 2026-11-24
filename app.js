let WHATSAPP = "";
let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

const moeda = v => "R$ " + v.toFixed(2).replace(".", ",");

async function carregarCardapio() {
  const lista = document.getElementById("lista-produtos");
  try {
    const res = await fetch("cardapio.json?v=" + Date.now());
    const dados = await res.json();
    WHATSAPP = dados.whatsapp;
    lista.innerHTML = "";

    const ativos = dados.produtos.filter(p => p.ativo);
    const categorias = [...new Set(ativos.map(p => p.categoria))];

    categorias.forEach(cat => {
      const titulo = document.createElement("h3");
      titulo.className = "categoria";
      titulo.textContent = cat;
      lista.appendChild(titulo);

      const grade = document.createElement("div");
      grade.className = "grade";
      ativos.filter(p => p.categoria === cat).forEach(p => {
        const el = document.createElement("div");
        el.className = "produto";
        el.innerHTML = `
          <h4>${p.nome}</h4>
          <p>${p.descricao}</p>
          <strong>${moeda(p.preco)}</strong>
          <button>Adicionar</button>`;
        el.querySelector("button").onclick = () => adicionar(p);
        grade.appendChild(el);
      });
      lista.appendChild(grade);
    });
  } catch (e) {
    lista.textContent = "Não foi possível carregar o cardápio. Tente novamente.";
  }
}

function salvar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderCarrinho();
}

function adicionar(p) {
  const item = carrinho.find(i => i.nome === p.nome);
  item ? item.qtd++ : carrinho.push({ nome: p.nome, preco: p.preco, qtd: 1 });
  salvar();
}

function alterar(nome, delta) {
  const item = carrinho.find(i => i.nome === nome);
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter(i => i.nome !== nome);
  salvar();
}

function renderCarrinho() {
  const ul = document.getElementById("itens-carrinho");
  ul.innerHTML = "";
  carrinho.forEach(i => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${i.qtd}x ${i.nome} – ${moeda(i.preco * i.qtd)}</span>
      <span>
        <button class="mini" data-d="-1">−</button>
        <button class="mini" data-d="1">+</button>
      </span>`;
    li.querySelectorAll("button").forEach(b =>
      b.onclick = () => alterar(i.nome, Number(b.dataset.d)));
    ul.appendChild(li);
  });
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  document.getElementById("total").textContent = moeda(total);
}

document.getElementById("finalizar").onclick = () => {
  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const obs = document.getElementById("obs").value.trim();

  if (!carrinho.length) return alert("Adicione ao menos um item.");
  if (!nome || !endereco) return alert("Preencha seu nome e endereço.");

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const msg =
    `*Novo pedido – Trailer do Moraes*\n\n` +
    `*Cliente:* ${nome}\n` +
    `*Endereço:* ${endereco}\n\n` +
    carrinho.map(i => `${i.qtd}x ${i.nome} – ${moeda(i.preco * i.qtd)}`).join("\n") +
    `\n\n*Total:* ${moeda(total)}` +
    (obs ? `\n*Obs:* ${obs}` : "");

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};

renderCarrinho();
carregarCardapio();
