const prompt = require('prompt-sync')();
const fs = require('fs');
let VCard = (args, logger) => {
    // Validation pour le nom et prénom (lettres uniquement)
    const regexNomPrenom = /^[\w.'-]+$/;

    // Validation pour le numéro de téléphone (France métropolitaine)
    const regexTelephone = /^(?:\+33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

    // Validation pour l'adresse email
    const regexEmail = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;

    //affichage infos
    console.log("**Remplissez la Vcard**\n")

    let nom, prenom, telephone, adresse, matiere, email;

    do {
        nom = prompt("Entrez votre nom: ");
    } while (!regexNomPrenom.test(nom));

    do {
        prenom = prompt("Entrez votre prénom: ");
    } while (!regexNomPrenom.test(prenom));

    do {
        telephone = prompt("Entrez votre numéro de téléphone (10 chiffres): ");
    } while (!regexTelephone.test(telephone));

    do {
        email = prompt("Entrez votre adresse email: ");
    } while (!regexEmail.test(email));

    const vCardData = `BEGIN:VCARD
        VERSION:4.0
        FN:${prenom} ${nom}
        TEL:${telephone}
        ADR:${adresse}
        EMAIL:${email}
        ROLE:${matiere}
        END:VCARD`.replace(/^\s+/gm, "");

    // Génération de la vCard
    console.log(vCardData);

    // Enregistrer la vCard dans un fichier
    const nomFichier = `${nom}_${prenom}_vcard.vcf`; // Nom du fichier
    fs.writeFile(nomFichier, vCardData, (err) => {
        if (err) {
            console.error('Erreur lors de l\'enregistrement du fichier:', err);
            return;
        }
        console.log('La vCard a été enregistrée avec succès dans', nomFichier);
    });
};

module.exports = VCard;
