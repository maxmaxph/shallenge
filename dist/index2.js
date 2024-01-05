const axios = require('axios');
const { createHash } = require('crypto');

const createChallengeEndpoint = "https://shallenge.onrender.com/challenges";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const passwordLength = 6;

// hashage d'une une chaîne en SHA256.
const doHash = (string) => {
    return createHash('sha256').update(string).digest('hex');
};

// je génère et qui teste les mdp.
const generatePassword = (salt, hash, prefix = '', position = 0) => {
    if (position === passwordLength) {
        if (doHash(Buffer.concat([salt, Buffer.from(prefix, 'utf-8')])) === hash) {
            return prefix;
        }
        return null;
    }

    for (let i = 0; i < alphabet.length; i++) {
        const result = generatePassword(salt, hash, prefix + alphabet[i], position + 1);
        if (result) return result;
    }

    return null;
};

const main = async () => {
    console.log('Envoi d’une requête pour créer un challenge...');
    console.time('Temps d’exécution'); // Début du chrono

    try {
        const challengeResponse = await axios.post(createChallengeEndpoint);
        const { salt, hash, id } = challengeResponse.data;
        console.log(`Salt reçu : ${salt}`);
        console.log(`ID du challenge reçu : ${id}`);

        console.log('Début de la génération et du test des mots de passe...');
        const saltBuffer = Buffer.from(salt, 'hex');
        const foundPassword = generatePassword(saltBuffer, hash);

        if (foundPassword) {
            console.log(`Mot de passe trouvé : ${foundPassword}`);
            console.log('Envoi de la réponse au challenge...');

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

    console.timeEnd('Temps d’exécution'); // Fin du chrono
};

main();
