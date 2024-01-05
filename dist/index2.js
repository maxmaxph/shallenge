// Importe les modules nécessaires pour les requêtes HTTP et le cryptage.
const axios = require('axios');
const { createHash } = require('crypto');

// L'URL de l'API pour créer un nouveau challenge.
const createChallengeEndpoint = "https://shallenge.onrender.com/challenges";
// L'alphabet utilisé pour générer les mots de passe.
const alphabet = "abcdefghijklmnopqrstuvwxyz";
// La longueur fixe du mot de passe à générer.
const passwordLength = 6;

// Fonction pour hasher une chaîne de caractères en SHA256.
const doHash = (string) => {
    return createHash('sha256').update(string).digest('hex');
};

// Fonction pour générer et tester les mots de passe.
const generatePassword = (salt, hash, prefix = '', position = 0) => {
    // Si la longueur du mot de passe est atteinte, vérifie si le hash correspond.
    if (position === passwordLength) {
        if (doHash(Buffer.concat([salt, Buffer.from(prefix, 'utf-8')])) === hash) {
            return prefix; // Retourne le mot de passe si le hash correspond.
        }
        return null; // Sinon, retourne null.
    }

    // Parcourt l'alphabet et teste chaque lettre possible.
    for (let i = 0; i < alphabet.length; i++) {
        // Appel récursif avec la lettre suivante ajoutée au mot de passe.
        const result = generatePassword(salt, hash, prefix + alphabet[i], position + 1);
        if (result) return result; // Si un mot de passe correspondant est trouvé, retourne-le.
    }

    return null; // Si aucun mot de passe valide n'est trouvé, retourne null.
};

// La fonction principale du script.
const main = async () => {
    console.log('Envoi d’une requête pour créer un challenge...');
    console.time('Temps d’exécution'); // Démarre un chronomètre pour mesurer le temps d'exécution.

    try {
        // Envoie une requête POST pour créer un nouveau challenge.
        const challengeResponse = await axios.post(createChallengeEndpoint);
        const { salt, hash, id } = challengeResponse.data;
        console.log(`Salt reçu : ${salt}`);
        console.log(`ID du challenge reçu : ${id}`);

        console.log('Début de la génération et du test des mots de passe...');
        const saltBuffer = Buffer.from(salt, 'hex');
        const foundPassword = generatePassword(saltBuffer, hash);

        // Si un mot de passe valide est trouvé.
        if (foundPassword) {
            console.log(`Mot de passe trouvé : ${foundPassword}`);
            console.log('Envoi de la réponse au challenge...');

            // Envoie la réponse trouvée à l'API.
            const answerResponse = await axios.post(`${createChallengeEndpoint}/${id}/answer`, JSON.stringify(foundPassword), {
                headers: { "Content-Type": "application/json" }
            });
            console.log(`Réponse de l'API à la soumission : ${answerResponse.data}`);
        } else {
            console.log('Aucun mot de passe valide trouvé.');
        }
    } catch (error) {
        console.error('Erreur lors de la communication avec l’API :', error);
    }

    console.timeEnd('Temps d’exécution'); // Arrête le chronomètre et affiche le temps écoulé.
};

main(); // Exécute la fonction principale.
