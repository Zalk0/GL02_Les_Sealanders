const fs = require('fs');
const colors = require('colors');
const GiftParser = require('./GiftParser.js');
const prompt = require('prompt-sync')();
const cli = require("@caporal/core").default;

const createQuiz = require('./fonctions/create.js');
const setCategory = require('./fonctions/setCategory.js');
const addComment = require('./fonctions/addComment.js');
const searchQuestion = require('./fonctions/searchQuestion.js');
const vcard = require('./fonctions/VCard.js');
const addQuestion = require('./fonctions/addQuestion.js');
const visualise = require('./fonctions/visualise.js');
const profileChart = require('./fonctions/profileChart.js');
const compareTestProfiles = require('./fonctions/compareTestProfiles.js');

cli
    .version('gift-parser-cli')
    .version('0.07')
    // check gift
    .command('check', 'Check if <file> is a valid gift file')
    .argument('<file>', 'The file to check with gift parser')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator: cli.BOOLEAN, default: false })
    .option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {

        // vérification de l'identité
        let connexion = login();
        if (connexion === "Professeur") {

            // On vérifie que le fichier existe
            if (!fs.existsSync(args.file)) {
                return logger.warn("Le fichier %s n'existe pas !".red, args.file);
            }


            fs.readFile(args.file, 'utf8', function (err, data) {
                if (err) {
                    return logger.warn(err);
                }

                var analyzer = new GiftParser(options.showTokenize, options.showSymbols);
                analyzer.parse(data);

                if (analyzer.errorCount === 0) {
                    logger.info("The .gift file is a valid gift file".green);
                } else {
                    logger.info("The .gift file contains error".red);
                }

                logger.debug(analyzer.parsedGIFT);

            });
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    // create
    .command('create', 'Create a gift file')
    .argument('<file>', 'The file to create')
    .action(({ args, options, logger }) => {

        // vérification de l'identité
        let connexion = login();
        if (connexion === "Professeur") {
            createQuiz(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    //setCategory
    .command('setCategory', 'Set the category of a GIFT file')
    .argument('<file>', 'The gift file to modify')
    .argument('<category>', 'The category to set')
    .action(({ args, options, logger }) => {

        // vérification de l'identité
        let connexion = login();
        if (connexion === "Professeur") {
            setCategory(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    //addComment
    .command('addComment', 'Add a comment to a GIFT file')
    .argument('<file>', 'The gift file to modify')
    .argument('<comment>', 'The comment to add')
    .alias('addc')
    .action(({ args, options, logger }) => {

        // vérification de l'identité
        let connexion = login();
        if (connexion === "Professeur") {
            addComment(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    //searchQuestion
    .command('searchQuestion', 'Search a question in a GIFT file')
    .argument('<file>', 'The gift file or repository to search')
    .argument('<question>', 'The question to search')
    .action(({ args, options, logger }) => {

        // vérification de l'identité
        let connexion = login();
        if (connexion === "Professeur") {
            searchQuestion(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    // Permet de créer la Vcard
    .command('Vcard', 'Create a Vcard')
    .action(({ args, options, logger }) => {

        let connexion = login();
        if (connexion === "Professeur") {
            vcard(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

    //addQuestion
    .command('addQuestion', 'Add a question to a GIFT file')
    .argument('<source>', 'The source folder or file')
    .argument('<file>', 'The gift file to modify')
    .argument('<question>', 'The title of the question to add')
    .alias('addq')
    .action(({ args, options, logger }) => {
        let connexion = login();
        if (connexion === "Professeur") {
            addQuestion(args, logger);
        }
    })

    // visualise
    .command('visualise', 'Visualiser une question d\'un questionnaire')
    .argument('<file>', 'Le fichier questionnaire')
    .argument('<question>', 'Le titre exact de la question à visualiser')
    .action(({ args, options, logger }) => {
        let connexion = login();
        if (connexion === "Professeur") {
            visualise(args, logger);
        } else {
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }

    })

    // profile with chart
    .command('profileChart', 'Generate the profile of a test or question bank and export it as Vega-lite chart')
    .alias('pflChart')
    .argument('<file>', 'The Gift file to use')
    // example : EM-U4-p32_33-Review.gift
    .action(({ args, options, logger }) => {
        profileChart(args, logger);
    })

    // **** SPEC 8 : Comparaison du profil d'un test avec un ou plusieurs fichiers de la banque nationale de questions ****
    .command('compareTestProfiles', "Comparaison du profil d'un test avec un ou plusieurs fichiers de la banque nationale de questions")
    .argument('<file>', 'un test')
    .argument('<dir>', 'un ou plusieurs fichiers de la banque nationale de questions')
    .alias('compare')
    .action(({ args, options, logger }) => {

        // ** Vérification de l'identité **
        let connexion = login();
        if (connexion === "Professeur") {
            compareTestProfiles(args, logger);
        } else {
            // Message si l'identification a échouée
            console.log('**Vous n\'avez pas les droits pour utiliser cette commande**');
        }
    })

cli.run(process.argv.slice(2));

// Partie fonctions ***************************************************************************************

// fonction connexion

function login() {
    const users = [
        { username: 'prof', password: 'profpass', role: 'Professeur' },
        { username: 'etu', password: 'etupass', role: 'étudiant' }
    ];

    // Si il y a un fichier token.json, on le lit, on vérifie que le timestamp est inférieur à 10 minutes et que le token est valide
    if (fs.existsSync('token.json')) {
        const token = fs.readFileSync('token.json', 'utf8');
        const tokenJSON = JSON.parse(token);
        const timestamp = tokenJSON.timestamp;
        const now = Date.now();
        const diff = now - timestamp;
        const minutesLeft = Math.round((600000 - diff) / 1000 / 60);
        if (diff < 600000 && tokenJSON.token != null) {
            console.log(('\nVotre token "' + tokenJSON.token + '" a été théoriquement vérifié dans la BDD et est encore valide pendant ' + minutesLeft + " minutes !\n").green);
            return tokenJSON.role;
        }
    }


    // Fonction de connexion
    function login(username, password) {
        const user = users.find(user => user.username === username && user.password === password);
        return user ? user : null;
    }

    // Demander le nom d'utilisateur et le mot de passe à l'utilisateur
    const usernameInput = prompt("Entrez votre nom d'utilisateur : ");
    const passwordInput = prompt.hide('Entrez votre mot de passe : '); // Masque le mot de passe lors de la saisie

    const loggedInUser = login(usernameInput, passwordInput);

    if (loggedInUser) {
        console.log(`\n**Connecté en tant que ${loggedInUser.username}. Rôle : ${loggedInUser.role}**\n`);
        let timestamp = Date.now();
        let token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let dataLog = {
            username: loggedInUser.username,
            role: loggedInUser.role,
            timestamp: timestamp,
            token: token
        }
        const userJSON = JSON.stringify(dataLog);
        fs.writeFileSync('token.json', userJSON);


        if (loggedInUser.role === 'Professeur' || loggedInUser.role === 'étudiant') {
            return loggedInUser.role
        }
    } else {
        console.log("**Mot de passe ou Nom d'utilisateur invalide**");
    }
}
