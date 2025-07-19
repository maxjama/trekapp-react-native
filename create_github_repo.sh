#!/bin/bash

echo "🚀 Creazione automatica repository GitHub..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per creare repository
create_repo() {
    local token=$1
    local repo_name="trekapp-react-native"
    local description="TrekApp - React Native/Expo hiking app with Firebase"
    
    echo -e "${YELLOW}Creando repository: $repo_name${NC}"
    
    # Crea repository via API
    response=$(curl -s -H "Authorization: token $token" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "{\"name\":\"$repo_name\",\"description\":\"$description\",\"private\":false}" \
        https://api.github.com/user/repos)
    
    # Verifica se la creazione è riuscita
    if echo "$response" | grep -q "html_url"; then
        echo -e "${GREEN}✅ Repository creato con successo!${NC}"
        repo_url=$(echo "$response" | grep -o '"html_url":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}Repository URL: $repo_url${NC}"
        
        # Configura remote e push
        git remote add origin "https://github.com/$(echo "$response" | grep -o '"full_name":"[^"]*"' | cut -d'"' -f4).git"
        git push -u origin main
        
        echo -e "${GREEN}✅ Codice caricato su GitHub!${NC}"
        return 0
    else
        echo -e "${RED}❌ Errore nella creazione del repository:${NC}"
        echo "$response"
        return 1
    fi
}

# Verifica se git è configurato
if ! git config --get user.name > /dev/null 2>&1; then
    echo -e "${RED}❌ Git non è configurato. Configura username ed email:${NC}"
    echo "git config --global user.name 'Il tuo nome'"
    echo "git config --global user.email 'tua.email@example.com'"
    exit 1
fi

# Verifica se ci sono modifiche non committate
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Ci sono modifiche non committate. Committando...${NC}"
    git add .
    git commit -m "Initial commit - TrekApp React Native/Expo project"
fi

# Richiedi token GitHub
echo -e "${YELLOW}Per creare automaticamente il repository, ho bisogno di un GitHub Personal Access Token.${NC}"
echo -e "${YELLOW}1. Vai su: https://github.com/settings/tokens${NC}"
echo -e "${YELLOW}2. Clicca 'Generate new token (classic)'${NC}"
echo -e "${YELLOW}3. Seleziona 'repo' per i permessi${NC}"
echo -e "${YELLOW}4. Copia il token generato${NC}"
echo ""
read -p "Incolla il token GitHub qui: " token

if [ -z "$token" ]; then
    echo -e "${RED}❌ Token non fornito. Uscita.${NC}"
    exit 1
fi

# Crea repository
create_repo "$token"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Repository creato e collegato con successo!${NC}"
    echo -e "${GREEN}Ora puoi vedere il tuo codice su GitHub!${NC}"
else
    echo -e "${RED}❌ Errore nella creazione del repository.${NC}"
    exit 1
fi 