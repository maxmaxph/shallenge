import { createHash } from 'crypto';

const createChallenge = "https://shallenge.onrender.com/challenges/";

// Fonction pour hasher une chaîne en utilisant SHA256.
function doHash(string){
    return createHash('sha256').update(string).digest('hex');
}

console.log('Envoi d’une requête pour créer un challenge...');
fetch(createChallenge, {
    method : "POST",
    headers: {
        "Content-Type": 'application/json'
    }
})
.then(response => {
    console.log('Réponse reçue de l’API pour créer un challenge.');
    return response.json(); // Convertit la réponse en JSON.
})
.then(responseData => {
    // Crée un buffer à partir du sel (salt) reçu, en supposant qu'il est en format hexadécimal.
    let salt = Buffer.from(responseData.salt, 'hex');
    console.log(`Salt reçu : ${salt.toString('hex')}`);
    console.log(`ID du challenge reçu : ${responseData.id}`);

    let abc = "abcdefghijklmnopqrstuvwxyz";

    console.log('Début de la génération et du test des mots de passe...');
    // Boucles imbriquées pour générer toutes les combinaisons possibles de mots de passe de 6 lettres.
    for(let i = 0; i < abc.length; i++){
        for(let j = 0; j < abc.length; j++){
            for(let k = 0; k < abc.length; k++){
                for(let l = 0; l < abc.length; l++){
                    for(let m = 0; m < abc.length; m++){
                        for(let n = 0; n < abc.length; n++){
                            // Génère un mot de passe à partir de la combinaison actuelle des indices des boucles.
                            let password = `${abc[i]}${abc[j]}${abc[k]}${abc[l]}${abc[m]}${abc[n]}`;
                            // Vérifie si le hash du mot de passe généré avec le sel correspond au hash attendu.
                            if(doHash(Buffer.concat([salt, Buffer.from(password,'utf-8')])) === responseData.hash){
                                console.log(`Mot de passe trouvé : ${password}`);

                                console.log('Envoi de la réponse au challenge...');
                                // Envoie la réponse au challenge à l'API.
                                fetch(`https://shallenge.onrender.com/challenges/${responseData.id}/answer`, {
                                    method : "POST",
                                    headers : {"Content-Type" : "application/json"},
                                    body : JSON.stringify(password)
                                })
                                .then(res => {
                                    console.log('Réponse reçue à la soumission du challenge.');
                                    return res.text();
                                })
                                .then(data => console.log(`Réponse de l'API à la soumission : ${data}`));

                                return console.log('Challenge résolu avec succès !');
                            }
                        }
                    }
                }
            }
        }
    }
    console.log('Aucun mot de passe valide trouvé.');
})
.catch(error => {
    console.error('Erreur lors de la communication avec l’API :', error);
});
