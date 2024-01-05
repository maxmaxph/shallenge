import axios from 'axios';
import * as crypto from 'crypto';

// Constantes pour l'API et les paramètres de génération de mot de passe.
const challengeEndpoint = 'https://shallenge.onrender.com/challenges';
const alphabet = 'abcdefghijklmnopqrstuvwxyz'; // Alphabet pour la génération de mots de passe.
const passwordLength = 6; // Longueur fixe pour les mots de passe.

// Interface pour définir la structure d'un Challenge.
interface Challenge {
    id: string;
    salt: string;
    hash: string;
}

// Fonction asynchrone pour créer un nouveau challenge via l'API.
const createChallenge = async (): Promise<Challenge> => {
    try {
        const response = await axios.post(challengeEndpoint);
        console.log('Challenge créé:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du challenge:', error);
        throw error; // Renvoie l'erreur pour un traitement ultérieur.
    }
};tsc

// Fonction pour calculer le hash SHA256 d'un mot de passe et d'un sel.
const calculateHash = (salt: string, password: string): string => {
    const sha256 = crypto.createHash('sha256');
    sha256.update(salt + password);
    return sha256.digest('hex');
};

// Fonction pour essayer tous les mots de passe possibles.
const tryPasswordRecursively = (challenge: Challenge, password = '', index = 0): string | null => {
    if (index === passwordLength) {
        const hash = calculateHash(challenge.salt, password);
        if (hash === challenge.hash) {
            return password;
        }
        return null;
    }

    for (const char of alphabet) {
        const foundPassword = tryPasswordRecursively(challenge, password + char, index + 1);
        if (foundPassword) return foundPassword;
    }

    return null;
};

const tryPasswords = (challenge: Challenge): string | null => {
    console.log('Essai des mots de passe...');
    return tryPasswordRecursively(challenge);
};

// Fonction asynchrone pour soumettre la réponse trouvée.
const submitAnswer = async (challenge: Challenge, password: string) => {
    console.log('Soumission de la réponse...');
    const response = await axios.post(`${challengeEndpoint}/${challenge.id}/answer`, `"${password}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
    console.log('Réponse reçue:', response.data);
    return response.data;
};

// Fonction pour tester le hash avec des valeurs connues.
const testPasswordWithKnownValues = (knownSalt: string, knownHash: string) => {
    console.log('Test avec des valeurs connues...');
    for (let i = 0; i < Math.pow(alphabet.length, passwordLength); i++) {
        let password = '';
        let temp = i;

        for (let j = 0; j < passwordLength; j++) {
            password += alphabet.charAt(temp % alphabet.length);
            temp = Math.floor(temp / alphabet.length);
        }

        const hash = calculateHash(knownSalt, password);
        if (hash === knownHash) {
            console.log(`Mot de passe trouvé pour les valeurs connues: ${password}`);
            return password;
        }
    }

    console.log('Aucun mot de passe valide trouvé pour les valeurs connues.');
    return null;
};

// Fonction principale orchestrant le déroulement du script.
const main = async () => {
    try {
        const challenge = await createChallenge();
        const password = tryPasswords(challenge);
        if (password) {
            const result = await submitAnswer(challenge, password);
            console.log('Résultat final:', result);
        } else {
            console.log('Le script a terminé sans trouver de mot de passe.');
        }
    } catch (error) {
        console.error('Erreur dans le script:', error);
    }
};

// Exemple de valeurs connues pour le test.
const knownValues = {
    salt: "74a980b97e3c64bfd4526979c99187fe",
    hash: "e59a6d4dcb6da88f3a4858f9730b5426e8d925733737273e234572e0ac53f190"
};

// Exécution de la fonction de test avec les valeurs connues.
const knownPassword = testPasswordWithKnownValues(knownValues.salt, knownValues.hash);
if (knownPassword) {
    console.log(`Le mot de passe pour les valeurs connues est : ${knownPassword}`);
} else {
    console.log("Le mot de passe pour les valeurs connues n'a pas été trouvé.");
}

// Exécution du script principal.
console.log('Démarrage du script principal...');
main().then(() => console.log('Script principal terminé')).catch(err => console.error('Erreur lors de l’exécution du script principal:', err));
