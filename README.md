# Alimente o Boneco

Jogo em HTML, CSS e JavaScript: alimente o personagem e veja músculo, gordura e saúde mudarem em tempo real.

## URL em `.io` (GitHub Pages)

No GitHub o site **já é hospedado em domínio `.io`**: `github.io`.

Você pode usar de dois jeitos:

| Opção | URL do jogo | Nome do repositório |
|--------|-------------|---------------------|
| **A — Site principal** | `https://brunlx.github.io/` | Exatamente `brunlx.github.io` |
| **B — Projeto** | `https://brunlx.github.io/NOME-DO-REPO/` | Qualquer nome (ex. `alimente-o-boneco`) |

**Recomendado para “só o .io” na raiz:** opção **A** (repositório com o mesmo nome do seu usuário GitHub + `.github.io`).

---

## Opção A — `https://seu-usuario.github.io/` (sem pasta no link)

### 1. Criar o repositório

1. [github.com/new](https://github.com/new)
2. Nome do repositório: **`brunlx.github.io`** (tem que ser exatamente assim)
3. Repositório **público**
4. Sem README na criação
5. **Create repository**

### 2. Enviar o jogo

```bash
cd /home/bruno/game

git init
git add .
git commit -m "Jogo Alimente o Boneco"
git branch -M main
git remote add origin https://github.com/brunlx/brunlx.github.io.git
git push -u origin main
```

### 3. Ativar Pages

**Settings** → **Pages** → Source: **Deploy from a branch** → `main` → **`/ (root)`** → Save.

Em 1–2 min o jogo abre em:

### **`https://brunlx.github.io/`**

---

## Opção B — `https://seu-usuario.github.io/nome-do-repo/`

Mesmo processo, mas o repositório pode ter outro nome (ex. `alimente-o-boneco`). O link terá o nome do repo no final.

---

## Domínio próprio `.io` (ex.: `meujogo.io`)

Isso é **opcional e pago** (registro em Namecheap, Porkbun, Cloudflare, etc.).

1. Compre um domínio `.io`
2. No DNS do domínio, crie um registro **CNAME** apontando para `SEU-USUARIO.github.io`
3. No repo: **Settings** → **Pages** → **Custom domain** → digite `meujogo.io`
4. (Opcional) Crie o arquivo `CNAME` na raiz do repo com só o domínio:

   ```
   meujogo.io
   ```

O GitHub ainda hospeda o site; você só usa um nome `.io` personalizado.

---

## Jogar no PC (local)

```bash
cd /home/bruno/game
python -m http.server 8000
```

Abra: `http://localhost:8000`

> Não abra o `index.html` pelo explorador (`file://`). Use GitHub Pages ou o servidor acima.

## Estrutura

```
index.html
style.css
script.js
js/
  foods.js
  renderer.js
  animation.js
  ui.js
  colors.js
```
