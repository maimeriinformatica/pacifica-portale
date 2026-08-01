# Pubblicare questo repository su GitHub

Il repository è **già pronto**: inizializzato, con il primo commit fatto e un
`.gitignore` sensato. È stato controllato che **non contenga segreti** (chiavi e
credenziali passano dalle variabili d'ambiente, non dai file). Ti resta solo da
crearlo sul tuo account e fare il push.

> Perché il push devi farlo tu: serve l'accesso al **tuo** account GitHub. Nessuno,
> nemmeno un assistente, dovrebbe pubblicare a nome tuo senza le tue credenziali.

## Via veloce — con GitHub CLI (`gh`)
Se hai (o installi) la GitHub CLI:
```bash
gh auth login                 # accedi una volta al tuo GitHub
gh repo create pacifica-portale --private --source=. --remote=origin --push
```
Fatto: crea il repo (privato) e carica tutto. Metti `--public` se lo vuoi pubblico.

## Via manuale — sito GitHub + git
1. Su **github.com** crea un nuovo repository **vuoto** (senza README, senza .gitignore,
   senza licenza), ad esempio `pacifica-portale`. Consigliato: **Private**.
2. Nella cartella del progetto:
```bash
git remote add origin https://github.com/TUO-UTENTE/pacifica-portale.git
git branch -M main
git push -u origin main
```
3. Quando chiede le credenziali: l'utente è il tuo, la "password" è un
   **Personal Access Token** (GitHub → *Settings → Developer settings →
   Personal access tokens*). La password normale dell'account non funziona più.
   In alternativa puoi usare una chiave **SSH** (`git@github.com:TUO-UTENTE/...`).

## Privato o pubblico?
Consiglio **Private** all'inizio: è la piattaforma di un ente reale. Nel repo non c'è
nulla di segreto, ma pubblico significa che chiunque vede il codice. Potrai renderlo
pubblico quando vuoi, dalle impostazioni del repo.

## Dopo il push
Collega il repo a **Render** seguendo `Deploy-Render.md` (New + → Blueprint → scegli il
repo). E ricorda: database, login e funzioni restano su **Supabase**, non su Render.
