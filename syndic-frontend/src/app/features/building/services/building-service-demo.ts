// audio-storage.service.ts
import { Injectable } from '@angular/core';
import { BuildingService } from './building-service';
import { Announcement, BuildingDocument, BuildingIssue, CoproBuilding, Resident, WorkItem } from '../building-models';

@Injectable({ providedIn: 'root' })
export class BuildingServiceDemo implements BuildingService {
  building = demoCopro;

  getBuilding(id: any): any {
    return this.building;
  }

  getTopic(reference: any): Resident | BuildingDocument | BuildingIssue | Announcement | WorkItem {
    if (!reference) return null;

    // Search in residents
    const resident = this.building.residents?.find(r => r.id === reference);
    if (resident) return resident;

    // Search in documents
    const document = this.building.documents?.find(d => d.id === reference);
    if (document) return document;

    // Search in history (issues)
    const issue = this.building.history?.find(h => h.id === reference);
    if (issue) return issue;

    // Search in announcements
    const announcement = this.building.announcements?.find(a => a.id === reference);
    if (announcement) return announcement;

    // Search in announcements
    const workItem = this.building.works?.find(a => a.id === reference);
    if (workItem) return workItem;

    return null;
  }

}


// --- Sample instance -----------------------------------------------------

export const demoCopro: CoproBuilding = {
  id: 'copro-001',
  name: 'Résidence du Canal',
  address: '12 rue du Canal, 75019 Paris',
  floors: 6,
  lots: 22,
  elevator: true,
  yearBuilt: 1898,
  managementType: 'benevole',
  volunteerManager: {
    name: 'Hélène Dupont',
    email: 'helene.dupont@example.com',
    since: '2022-03-01',
  },
  residents: [
    { id: 'r1', name: 'Martin Lefèvre', lot: '3B', owner: true, thousandths: 45 },
    { id: 'r2', name: 'Julie Moreau', lot: '3A', owner: false, thousandths: 45 },
    { id: 'r3', name: 'Sofia Hernandez', lot: 'RDC-A', owner: true, thousandths: 40 },
    { id: 'r4', name: 'Antoine Bernard', lot: '2A', owner: true, thousandths: 45 },
    { id: 'r5', name: 'Imane Khelifi', lot: '4A', owner: false, thousandths: 50 },
    { id: 'r6', name: 'Lucie Petit', lot: 'RDC-B', owner: true, thousandths: 35 },
    { id: 'r7', name: 'Karim Diallo', lot: 'RDC-C', owner: false, thousandths: 35 },
    { id: 'r8', name: 'Claire Girard', lot: '1A', owner: true, thousandths: 40 },
    { id: 'r9', name: 'Peter Snowdon', lot: '1B', owner: true, thousandths: 40 },
    { id: 'r10', name: 'Paul Nguyen', lot: '1C', owner: true, thousandths: 35 },
    { id: 'r11', name: 'Elise Fontaine', lot: '2B', owner: true, thousandths: 45 },
    { id: 'r12', name: 'Omar Benali', lot: '2C', owner: false, thousandths: 40 },
    { id: 'r13', name: 'Clara Dubois', lot: '3C', owner: true, thousandths: 40 },
    { id: 'r14', name: 'Nadia Laurent', lot: '4B', owner: true, thousandths: 50 },
    { id: 'r15', name: 'Hugo Carpentier', lot: '4C', owner: false, thousandths: 45 },
    { id: 'r16', name: 'Amina Rahmani', lot: '5A', owner: true, thousandths: 60 },
    { id: 'r17', name: 'Victor Le Goff', lot: '5B', owner: true, thousandths: 60 },
    { id: 'r18', name: 'Baptiste Cohen', lot: '5C', owner: false, thousandths: 55 },
    { id: 'r19', name: 'Camille Marchand', lot: '6A', owner: true, thousandths: 75 },
    { id: 'r20', name: 'Laurent Muller', lot: '6B', owner: true, thousandths: 75 },
    { id: 'r21', name: 'Jeanne Roussel', lot: 'Combles-1', owner: false, thousandths: 22 },
    { id: 'r22', name: 'Didier Pelletier', lot: 'Combles-2', owner: true, thousandths: 23 },
  ],
  rules: {
    quietHours: '22h00–7h00',
    wastePolicy: {
      binsOut: 'Tuesday & Friday nights',
      recyclingRules: 'Glass in green bin, cardboard and paper in yellow bin',
    },
    pets: {
      allowed: true,
      rules:
        'Pets must not disturb neighbors; dogs must be kept on a lead in common areas',
    },
    renovationPolicy: {
      noticeRequired: 'At least 7 days before noisy works',
      forbiddenHours: 'No loud work on Sundays or after 19h00',
    },
    smoking: {
      forbiddenAreas: ['hall', 'staircase', 'elevator'],
      notes: 'Cigarette butts must not be thrown in the courtyard',
    },
  },
  history: [
    {
      id: 't2023-01',
      title: 'Radiateurs froids aux 2e et 3e étages',
      category: 'heating',
      status: 'resolved',
      reportedBy: 'r1',
      date: '2023-01-05',
      description: 'Radiateurs à peine tièdes pendant la vague de froid.',
      resolution: 'Pression de chaudière réajustée par la société de maintenance.',
    },
    {
      id: 't2023-03',
      title: "Bruits nocturnes persistants de l’appartement 2A",
      category: 'noise',
      status: 'resolved',
      reportedBy: 'r3',
      date: '2023-03-12',
      description: 'Musique et voix fortes après minuit.',
      resolution: 'Échange avec le locataire ; nuisances arrêtées.',
    },
    {
      id: 't2023-06',
      title: 'Fuite au plafond de la cage d’escalier',
      category: 'water',
      status: 'resolved',
      reportedBy: 'r2',
      date: '2023-06-21',
      description: 'Traces d’eau et gouttes au-dessus du palier du 3e.',
      resolution: 'Joint de tuyauterie réparé.',
    },
    {
      id: 't2023-10',
      title: 'Bacs à ordures débordants dans la cour',
      category: 'waste',
      status: 'resolved',
      reportedBy: 'r5',
      date: '2023-10-04',
      description: 'Bacs non sortis pour deux collectes.',
      resolution: 'Tour de volontaires mis à jour.',
    },
    {
      id: 't2024-02',
      title: 'Panne d’ascenseur pendant 48h',
      category: 'elevator',
      status: 'open',
      reportedBy: 'r4',
      date: '2024-02-17',
      description: 'Ascenseur bloqué entre le 2e et le 3e étage.',
      resolution: 'Courroie moteur remplacée.',
      image: '/assets/stock/elevator.jpg'
    },
    {
      id: 't2024-05',
      title: 'Humidité et moisissure dans la chambre (4A)',
      category: 'humidity',
      status: 'open',
      reportedBy: 'r5',
      date: '2024-05-02',
      description: 'Taches de moisissure en expansion sur le mur extérieur.',
      resolution: null,
    },
    {
      id: 't2024-11',
      title: 'Odeur suspecte en sous-sol',
      category: 'pests',
      status: 'in-progress',
      reportedBy: 'r3',
      date: '2024-11-14',
      description: 'Présence possible de rongeurs ou canalisation bouchée.',
      resolution: null,
    },
    {
      id: 't2025-01',
      title: 'Infiltration d’eau par la toiture lors des fortes pluies',
      category: 'water',
      status: 'open',
      reportedBy: 'r1',
      date: '2025-01-03',
      description: 'Gouttes provenant d’un angle du plafond des combles.',
      resolution: null,
    },
  ],
  announcements: [
    {
      id: 'ann1',
      title: 'Travaux toiture — début 10 janvier',
      message:
        'Les travaux de réfection de la toiture commenceront le 10 janvier. Durée estimée : 3 semaines.',
      date: '2024-12-15',
      kind: 'works',
      image: '/assets/stock/roofs.jpg'
    },
    {
      id: 'ann2',
      title: 'Collecte des encombrants',
      message:
        'Prochaine collecte le 18 décembre. Merci de déposer la veille seulement.',
      date: '2024-12-10',
      kind: 'info',
      image: '/assets/stock/bins.jpg'
    },
  ],
  works: [
    {
      id: 'w1',
      title: 'Réfection toiture',
      status: 'planned',
      startDate: '2025-01-10',
      endDate: null,
      budget: 18000,
      contractor: 'Toitures Parisiennes',
    },
    {
      id: 'w2',
      title: "Révision de l'ascenseur",
      status: 'done',
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      budget: 2300,
      contractor: 'Elevatis SARL',
    },
  ],
  "documents": [
    {
      "id": "doc-agm-2024-pv",
      "type": "agm-minutes",
      "title": "Procès-verbal de l’Assemblée Générale Ordinaire 2024",
      "language": "fr",
      "date": new Date("2024-05-12"),
      "buildingId": "copro-001",
      "tags": ["AG", "minutes", "legal"],
      "content": {
        "header": {
          "residenceName": "Résidence du Canal",
          "address": "12 rue du Canal, 75019 Paris",
          "meetingType": "Assemblée Générale Ordinaire",
          "location": "Salle municipale Jean Jaurès, Paris 19e",
          "time": "18h30–20h15"
        },
        "attendance": {
          "presentAndRepresented": [
            "Hélène Dupont – Présidente du Conseil Syndical",
            "Martin Lefèvre (lot 3B)",
            "Sofia Hernandez (lot RDC-A)",
            "Antoine Bernard (lot 2A)",
            "Imane Khelifi (lot 4A, représentée)"
          ],
          "quorumStatement": "Quorum atteint conformément à la loi du 10 juillet 1965."
        },
        "agendaItems": [
          {
            "number": 1,
            "title": "Réfection de la toiture",
            "description": "Présentation du devis et des raisons des travaux suite aux infiltrations récurrentes.",
            "proposal": {
              "supplier": "Toitures Parisiennes",
              "amountEUR": 18000
            },
            "vote": {
              "forPercent": 82,
              "againstPercent": 18,
              "result": "adopté"
            },
            "actions": [
              "Lancement des travaux à partir du 10 janvier 2025."
            ]
          },
          {
            "number": 2,
            "title": "Révision générale de l’ascenseur",
            "description": "Intervention préventive recommandée pour limiter les pannes.",
            "proposal": {
              "supplier": "Elevatis SARL",
              "amountEUR": 2300
            },
            "vote": {
              "forPercent": 100,
              "againstPercent": 0,
              "result": "adopté"
            },
            "notes": [
              "Intervention réalisée en février 2024.",
              "PV de l’intervention joint au dossier."
            ]
          },
          {
            "number": 3,
            "title": "Budget prévisionnel 2025",
            "description": "Présentation et vote du budget incluant une augmentation de 5% du fond travaux.",
            "proposal": {
              "budgetEUR": 23500,
              "comments": "Augmentation du fonds travaux pour anticiper la toiture."
            },
            "vote": {
              "forPercent": 75,
              "againstPercent": 25,
              "result": "adopté"
            }
          },
          {
            "number": 4,
            "title": "Renouvellement du mandat bénévole",
            "description": "Renouvellement du mandat de syndic bénévole au profit d’Hélène Dupont.",
            "vote": {
              "forPercent": 100,
              "againstPercent": 0,
              "result": "adopté"
            }
          }
        ],
        "closing": {
          "time": "20h15",
          "note": "Le présent procès-verbal sera transmis à tous les copropriétaires."
        }
      }
    },
    {
      "id": "doc-agm-2025-convocation",
      "type": "agm-convocation",
      "title": "Convocation à l’Assemblée Générale Ordinaire 2025",
      "language": "fr",
      "date": new Date("2025-04-02"),
      "buildingId": "copro-001",
      "tags": ["AG", "convocation", "legal"],
      "content": {
        "header": {
          "residenceName": "Résidence du Canal",
          "address": "12 rue du Canal, 75019 Paris"
        },
        "meeting": {
          "meetingType": "Assemblée Générale Ordinaire",
          "date": "2025-05-18",
          "time": "18h30",
          "location": "Salle municipale Jean Jaurès, 75019 Paris"
        },
        "intro": "Chers copropriétaires, vous êtes convoqués à l’Assemblée Générale annuelle de la Résidence du Canal.",
        "agenda": [
          "Lecture et approbation du procès-verbal 2024",
          "Vote du budget prévisionnel 2025",
          "Point sur l’avancement des travaux de toiture",
          "Information sur les sinistres en cours (humidité 4A, cave)",
          "Renouvellement du conseil syndical",
          "Questions diverses"
        ],
        "attachments": [
          {
            "documentId": "doc-agm-2024-pv",
            "label": "Procès-verbal AG 2024"
          },
          {
            "documentId": "doc-budget2025",
            "label": "Projet de budget 2025"
          },
          {
            "documentId": "doc-roof-devis-2025",
            "label": "Devis toiture mis à jour"
          }
        ],
        "notes": {
          "proxyInstructions": "Pour être représenté, merci de compléter le pouvoir joint et de le remettre au syndic bénévole ou à un copropriétaire de votre choix.",
          "contact": "En cas de difficulté pour assister, contactez le syndic bénévole."
        }
      }
    },
    {
      "id": "doc-rules-summary",
      "type": "reglement-copro-summary",
      "title": "Résumé du Règlement de Copropriété",
      "language": "fr",
      "date": new Date("2010-01-01"),
      "buildingId": "copro-001",
      "tags": ["reglement", "rules", "summary"],
      "content": {
        "intro": "Ce document est un résumé non contractuel du règlement de copropriété de la Résidence du Canal. En cas de doute, seule la version publiée au fichier immobilier fait foi.",
        "sections": [
          {
            "title": "1. Parties privatives",
            "points": [
              "Chaque lot comprend les pièces intérieures, les fenêtres et portes, ainsi que les installations électriques privatives.",
              "Le copropriétaire doit maintenir son lot en bon état d’entretien et de sécurité.",
              "Les travaux à l’intérieur du lot ne doivent pas porter atteinte aux parties communes ou à la solidité de l’immeuble."
            ]
          },
          {
            "title": "2. Parties communes",
            "points": [
              "Les parties communes comprennent notamment : toiture, façade, colonnes d’eau, cage d’escalier, couloirs, local vélos et cour intérieure.",
              "Toute modification ou occupation durable des parties communes nécessite un vote en Assemblée Générale."
            ]
          },
          {
            "title": "3. Jouissance des lieux et bruits",
            "points": [
              "Les bruits excessifs sont interdits, en particulier entre 22h00 et 7h00.",
              "Les occupants doivent éviter les nuisances sonores répétées (musique forte, fêtes nocturnes, etc.)."
            ]
          },
          {
            "title": "4. Animaux de compagnie",
            "points": [
              "Les animaux domestiques sont autorisés sous réserve de ne pas causer de nuisances aux autres occupants.",
              "Les chiens doivent être tenus en laisse dans les parties communes."
            ]
          },
          {
            "title": "5. Travaux dans les lots",
            "points": [
              "Les travaux lourds (percements, modifications structurelles, changement de fenêtres) doivent être signalés au syndic.",
              "Les travaux bruyants sont interdits le dimanche et après 19h00 les autres jours."
            ]
          },
          {
            "title": "6. Déchets et encombrants",
            "points": [
              "Les bacs doivent être sortis les soirs de collecte uniquement.",
              "Les encombrants doivent être déposés la veille de la collecte municipale.",
              "Il est strictement interdit de jeter des mégots ou déchets dans la cour ou les parties communes."
            ]
          },
          {
            "title": "7. Sanctions",
            "points": [
              "En cas de non-respect répété du règlement, le syndic peut adresser des rappels écrits et proposer des mesures en AG.",
              "Les frais liés à certains manquements peuvent être imputés au copropriétaire concerné après décision d’Assemblée Générale."
            ]
          }
        ]
      }
    },
    {
      "id": "doc-budget2025",
      "type": "budget-previsionnel",
      "title": "Budget Prévisionnel 2025 – Résidence du Canal",
      "language": "fr",
      "date": new Date("2024-11-01"),
      "buildingId": "copro-001",
      "tags": ["budget", "finances", "2025"],
      "content": {
        "year": 2025,
        "sections": {
          "chargesGenerales": [
            { "label": "Assurance immeuble", "amountEUR": 3200 },
            { "label": "Électricité parties communes", "amountEUR": 1450 },
            { "label": "Eau froide collective", "amountEUR": 2800 },
            { "label": "Contrat chaudière", "amountEUR": 1900 },
            { "label": "Entretien parties communes", "amountEUR": 1600 }
          ],
          "fondsTravaux": [
            { "label": "Provision annuelle fonds travaux (loi ALUR)", "amountEUR": 6000 }
          ],
          "travauxPrevus": [
            { "label": "Réfection toiture – tranche 1", "amountEUR": 6550 }
          ]
        },
        "totals": {
          "chargesGeneralesEUR": 10950,
          "fondsTravauxEUR": 6000,
          "travauxPrevusEUR": 6550,
          "totalEUR": 23500
        },
        "notes": [
          "Le budget inclut une augmentation de 5% du fonds travaux par rapport à l’exercice précédent.",
          "Le montant destiné à la toiture pourra être ajusté en fonction des devis finaux."
        ]
      }
    },
    {
      "id": "doc-building-sheet",
      "type": "building-info-sheet",
      "title": "Fiche d’Informations – Résidence du Canal",
      "language": "fr",
      "date": new Date("2024-12-15"),
      "buildingId": "copro-001",
      "tags": ["fiche", "immeuble", "synthese"],
      "content": {
        "identity": {
          "name": "Résidence du Canal",
          "address": "12 rue du Canal, 75019 Paris",
          "yearBuilt": 1898,
          "lots": 22,
          "floors": 6,
          "elevator": true,
          "managementType": "benevole",
          "manager": {
            "name": "Hélène Dupont",
            "email": "helene.dupont@example.com",
            "since": "2022-03-01"
          }
        },
        "keyPoints": [
          "Immeuble ancien de 6 étages avec ascenseur.",
          "Gestion en syndic bénévole depuis 2022.",
          "Historique d’infiltrations au niveau de la toiture.",
          "Quelques problèmes d’humidité sur la façade nord (lot 4A).",
          "Signalements récurrents d’odeurs en cave (potentiels rongeurs / canalisations)."
        ],
        "currentTopics": [
          "Préparation et suivi des travaux de toiture (démarrage prévu en janvier 2025).",
          "Suivi des dossiers d’humidité et d’odeurs en sous-sol.",
          "Organisation de l’AG 2025 et mise à jour du budget prévisionnel."
        ],
        "useInApp": {
          "forAI": "Document utilisé comme fiche de contexte générale pour répondre aux questions sur l’immeuble.",
          "forResidents": "Vue synthétique pour expliquer rapidement la situation aux nouveaux copropriétaires ou locataires."
        }
      }
    }
  ]
};


/**
 * the idea would be to cut this up but not sure of the best 
 * approach and given the context size ... lets see
 */
export const copro = `
EXEMPLE DE RÈGLEMENT DE COPROPRIÉTÉ
I. DROITS ET OBLIGATIONS DES COPROPRIÉTAIRES
1. Règlement
d'ordre intérieur
Il pourra être établi un règlement d'ordre
intérieur approuvé par l'assemblée générale des copropriétaires qui réglera les
problèmes liés à la vie en commun dans l'immeuble y compris les devoirs et
droits de chacun.
2. Modifications
a. Diviser ou Relier un lot
privatif
Il n'est pas permis de diviser une unité
privative sans accord préalable de l’assemblée générale des copropriétaires aux
majorités requises de par la Loi.
Il est permis de réunir plusieurs unités
privatives d'un même niveau ou de niveaux diffé­rents mais se touchant par
plancher et plafond; dans ce cas, les millièmes attachés aux deux unités
réunies seront additionnées. Cette réunion ne pourra se faire sans les
autorisations administratives en bonne et due forme préalablement requises le
cas échéant.
b. Parties privatives
Chaque propriétaire a le droit de jouir et de
disposer de ses locaux privatifs dans les limites fixées par le présent règlement
et à condition de ne pas nuire aux droits des autres copropriétaires et de ne
rien faire qui puisse compromettre la solidité de l'immeuble.
Chacun peut modifier comme bon lui semble la
distribution intérieure de son local privatif, mais sous sa responsabilité à
l'égard des affaissements, dégradations et autres accidents et inconvénients
qui en seraient la conséquence pour les parties communes ou les locaux des
autres propriétaires.
Il est interdit aux propriétaires de faire
même à l'intérieur de leurs locaux privatifs la moindre modification aux choses
communes, sauf à se conformer aux dispositions de l'article suivant. De plus,
tous travaux d'importance touchant à la structure de l'immeuble doit recevoir
l'assenti­ment des copropriétaires conformément à l'article 577-7 du Code
Civil.
Des limites
de la jouissance des parties privatives
Harmonie: rien de
ce qui concerne le style et l'harmonie de l'immeuble, même s'il s'agit de
choses dépendant privativement des entités privatives, ne pourra être modifié
que par décision de l'assemblée générale prise à la majorité des trois/quarts
des voix des propriétaires présents ou représentés.
Location: le
copropriétaire pourra donner sa propriété privative en location; il est seul
responsable de son locataire, ainsi que de tout occupant éventuel et a seul
droit au vote inhérent à sa qualité de copropriétaire, sans pouvoir céder son
droit à son locataire ou occupant à moins que ceux-ci ne soient dûment
mandatés.
Occupation :
Toute stipulation de restriction d’occupation future éventuelle, laquelle devra
faire l’objet le jour venu d’un acte de base modificatif, ne pourra être
décidée exclusivement qu’à l’unanimité et par l’ensemble de tous les
copropriétaires réunis en assemblée générale dûment convoquée.
Destination des lieux
Les diverses entités
privatives pourront être affectées à des bureaux, commerces, professions
libérales, cabinets médicaux ou toute autre activité généralement quelconque sans autorisation préalable de la
copropriété mais pour autant qu'aient été obtenues les autorisations
administratives requises.
c. Parties communes
Les travaux
de modification aux parties communes ne pourront être exécutés qu'avec
l'autorisation expresse de l'assemblée des copropriétaires, statuant à la
majorité des trois/quarts des voix des propriétaires présents ou représentés.
3.Servitudes
Les copropriétaires doivent donner accès à
leurs locaux privatifs pour tous travaux et répara­tions, nettoyage et
entretien des parties communes.
Si les copropriétaires ou les occupants
s'absentent, ils doivent obligatoirement remettre une clé de leurs locaux
privatifs à un mandataire habitant l'agglomération [préciser l’agglomération de l’immeuble],
mandataire dont le nom et l'adresse devront être portés à la connaissance du
gérant, de telle manière que l'on puisse avoir accès aux locaux privatifs, si
la chose était nécessaire.
Les copropriétaires devront supporter sans
indemnité les inconvénients résultant des répara­tions aux parties communes,
qui seront décidées d'après les règles qui précèdent.
4. Assurances
De la
responsabilité en général
Le comparant
fera assurer l'immeuble contre tous risques et souscrira la première police à
cet effet. La prime sera une première charge commune.
Cas de
sinistre
En cas de
sinistre, les indemnités allouées en vertu de la police seront encaissées par
le syndic et déposées en banque, sur un compte spécial à ouvrir au nom des
copropriétaires.
L'utilisation
de ces indemnités sera réglée entre les copropriétaires, et le cas échéant
comme suit :
L'indemnité d'assurance ainsi que le produit de la licitation éventuelle,
seront partagés entre les copropriétaires dans la proportion de leurs quotités
dans les parties communes.
Les droits de chaque copropriétaire à l'égard
de la copropriété peuvent être défendus individuel­lement et chaque
copropriétaire peut agir au nom et pour compte d'une copropriété défaillante
conformé­ment à l'article 577-9 du Code Civil.
6. Mitoyenneté
- cession choses communes
L'association des copropriétaires pourra pour
compte des copropriétaires vendre ou échanger les choses communes envers un
tiers (mur mitoyen local, commun,...) en percevoir les prix et signer tout acte
nécessaire à cet effet.
L'association des copropriétaires devra
néanmoins tenir compte des droits éventuels des créanciers privilégiés.
II. CRITERES ET MODES DE
CALCULS DE LA REPAR­TITION DES CHARGES
1. Principe
De même que les charges d'entretien, de
réparation et d'administration des parties communes dont il est question dans
l'acte de base, les charges nées des besoins communs seront supportées par les
copropriétaires, proportionnellement à leurs millièmes dans les parties
communes, éven­tuellement suivant des millièmes spécifiques.
Tels sont les dépenses de consommation des
parties communes, les frais d'achat, d'entretien et de remplacement du matériel
et mobilier commun, ustensiles et fournitures et charges nécessaires au bon
entretien de l'immeuble, et caetera.
Le tout conformément à la loi sur la
copropriété.
2. Impôts
A moins que les impôts relatifs à l'immeuble
ne soient établis directement sur chaque propriété privative, ces impôts seront
répartis entre les copropriétaires proportionnellement à leurs milliè­mes dans
les parties communes de l'immeuble.
3. Responsabilité
civile
La responsabilité du fait de l'immeuble
(article 1386 du Code Civil) et de façon générale toutes les charges de
l'immeuble se répartissent proportionnellement aux millièmes dans les parties
communes, sans préjudice au recours que l'associa­tion des copropriétaires
pourrait avoir contre celui dont la responsabilité personnelle est engagée,
tiers ou copropriétaire.
4.Augmentation des charges
Dans le cas où un copropriétaire augmenterait
les charges communes pour son usage personnel, il supportera seul cette
augmentation.
ASSOCIATION DES COPROPRIETAIRES
A-ASSEMBLEE GENERALE DES COPROPRIETAIRES
1. Dénomination
L'association des copropriétaires porte la
dénomination de
"Association
des copropriétaires [préciser
l’adresse de l’immeuble]".
2. Siège
Le siège de l'association se trouve dans
l'immeuble objet du présent acte.
3. Pouvoirs
L'assemblée générale des copropriétaires
dispose de tous les pouvoirs de gestion et d'administration de l'association
des copropriétaires à l'exception de ceux attribués en vertu de la loi et des
présents statuts au syndic et à chaque copropriétaire.
Sous cette réserve, l'assemblée générale des
copropriétaires est souveraine maîtresse de l'administration de l'immeuble en
tant qu'il s'agit des intérêts communs. Elle dispose en conséquence des
pouvoirs les plus étendus, en se conformant aux présents statuts et aux lois en
la matière, de décider souverainement des intérêts communs.
4. Composition
L'assemblée générale se compose
de tous les copropriétaires quel que soit le nombre de quotités possédées par
chacun d'eux.
En cas de démembrement du droit
de propriété ou d'indivision ordinaire, le droit de participer aux
délibérations de l'assemblée générale est suspendu jusqu'à ce que les
intéressés désignent celui qui exercera ce droit. Les parties règleront dans la
même convention la contribution au fonds de réserve et au fonds de roulement; à
défaut, l'usufruitier participera seul au fonds de roulement, le
nu-propriétaire aura seul la charge relative à la constitution du fonds de
réserve.
Chaque copropriétaire pourra
désigner un mandataire, copropriétaire ou non, pour le représenter aux
assemblées générales, mais personne ne pourra représenter un copropriétaire
s'il n'est pas porteur d'un mandat écrit sur lequel il sera stipulé
expressément la date de l'assemblée générale, à peine de quoi le mandat sera
réputé inexistant. Le syndic ne peut intervenir comme mandataire à l'assemblée
générale.
Le bureau de l'assemblée générale vérifie la
régularité des procurations et statue souverainement à ce sujet.
Les procurations resteront annexées aux
procès-verbaux.
Faute de notification par les intéressés au
syndic (par lettre recommandée ou contre
accusé de réception) de tous changements d'adresse ou tous changements de
propriétaire, les convocations seront valablement faites à la dernière adresse
connue ou au dernier propriétaire connu.
5. Date et
lieu de l'assemblée générale statutaire
L'assemblée générale annuelle se tient au
cours des 15 premiers jours du mois de juin à l’heure et à l'endroit indiqué
dans les convocations et à défaut au siège de l'association des
copropriétaires.
6.
Convocation
Le syndic doit convoquer l'assemblée générale
ordinaire.
Il peut, en outre, la convoquer à tout moment
lorsqu'une décision doit être prise d'urgence dans l'intérêt de la copropriété.
Un ou plusieurs copropriétaires possédant au
moins un/cinquième des quotes-parts dans les parties communes peuvent demander
la convocation de l'assemblée générale. Cette demande doit être adressée par
pli recommandé au syndic qui sera tenu d'envoyer les convocations dans les
trente jours de sa réception.
Tout copropriétaire peut également demander
au juge d'ordonner la convocation d'une assemblée générale dans le délai que ce
dernier fixe afin de délibérer sur la proposition que ledit copropriétaire
détermine, lorsque le syndic néglige ou refuse abusivement de le faire.
Les convocations sont envoyées quinze jours
francs au moins avant la date de l'assemblée, par lettre ordinaire si
l'assemblée a lieu à date fixe ou par lettre recommandée en cas de report de
l'assemblée générale annuelle ou de convocation pour une assemblée générale
extraordinaire; la convocation sera aussi valablement faite si les destinataires acceptent, individuellement,
explicitement et par écrit, de recevoir la convocation par un autre moyen de
communication. Les convocations envoyées à la dernière adresse connue du syndic
à la date de l'envoi sont réputées régulières.
Ce délai sera réduit à cinq jours francs
lorsqu'une décision doit être prise d'urgence dans l'intérêt de la copropriété.
Si une première assemblée n'est pas en
nombre, une seconde assemblée pourra être convoquée de la même manière, après
un délai de quinze jours au moins, avec le même ordre du jour qui indiquera
qu'il s'agit d'une deuxième assemblée, mais le délai de convocation sera de
cinq jours francs au moins et dix jours francs au plus.
7. Ordre du
jour
L'ordre du jour est arrêté par celui qui
convoque l'assemblée.
Tous les points à l'ordre du jour doivent
être indiqués dans les convocations d'une manière claire.
L'assemblée générale ne peut délibérer et
voter que sur les points inscrits à l'ordre du jour. Les points soulevés sous
le « divers » ne peuvent être valablement votés que si le détail en
figurait au préalable à l'ordre du jour.
Chacun des copropriétaires a le droit de
demander l'inscription d'un point à l'ordre du jour.
8.
Constitution de l'assemblée
L'assemblée
générale est présidée par un copropriétaire.
L'assemblée générale n'est valablement
constituée que si tous les copropriétaires concernés sont présents, représentés
ou dûment convoqués.
Les délibérations et décisions d'une
assemblée générale obligent tous les copropriétaires concernés sur les points
se trouvant à l'ordre du jour, qu'ils aient été représentés ou non, dissidents
ou incapables.
9.
Délibérations
Chaque copropriétaire dispose d'un nombre de
voix correspondant à sa quote-part dans les parties communes. Les
copropriétaires disposent d'une voix par millième (1.000) qu'ils possèdent dans les parties
communes.
Nul ne peut prendre part au vote, même comme
mandataire, pour un nombre de voix supérieur à la somme des voix dont disposent
les autres copropriétaires présents ou représentés.
L'assemblée
générale ne délibère valablement que si, au début de l'assemblée générale, plus
de la moitié des copropriétaires sont présents ou représentés et pour autant
qu'ils possèdent au moins la moitié des quotes-parts dans les parties communes.
Néanmoins,
l'assemblée générale délibère aussi valablement si les copropriétaires présents
ou représentés au début de l'assemblée générale représentent plus de trois
quarts des quotes-parts dans les parties communes.
Si aucun des deux
quorums n'est atteint, une deuxième assemblée générale sera réunie après un
délai de quinze jours au moins et pourra délibérer quels que soient le nombre
des membres présents ou représentés et les quotes-parts de copropriété dont ils
sont titulaires.
Les délibérations sont prises à la majorité
absolue des voix des copropriétaires, sauf le cas où une majorité plus forte
est requise par la loi, les présents statuts, ou par le règlement d'ordre
intérieur.
Les abstentions,
les votes nuls et blancs ne sont pas considérés comme des voix émises pour le
calcul de la majorité requise.
Sans préjudice à la règle de l'unanimité
prévue ci-dessous, lorsque plus de deux propositions sont soumises au vote et
lorsqu'aucune d'elle n'obtient la majorité
requise, il est procédé à un deuxième tour de scrutin, seules les deux
propositions ayant obtenu le plus de voix au premier tour étant soumises au
vote.
Les délibérations de l'assemblée générale
sont consignées par les soins du syndic dans un registre déposé au siège de
l'association des copropriétaires. Ce registre
peut être consulté sur place et
sans frais par tous intéressés. Il est signé par le syndic. Les procès-verbaux
doivent être consignés dans le registre au plus tard dans un délai de quinze
jours par le syndic ou le copropriétaire désigné, à peine d'exposer sa responsabilité.
Tout copropriétaire peut demander à consulter
le registre des procès-verbaux et en prendre copie sans déplacement, au siège
de l'association des copropriétaires.
10. Majorité
spéciale - Unanimité
L'assemblée
générale décide :
1°
à la majorité des trois quarts des voix :
a) de
toute modification aux statuts pour autant qu'elle ne concerne que la
jouissance, l'usage ou l'administration des parties communes;
b) de
tous travaux affectant les parties communes, à l'exception de ceux qui peuvent être
décidés par le syndic;
c) dans
toute copropriété de moins de vingt lots, à l'exclusion des caves, garages et
parkings, de la création et de la composition d'un conseil de copropriété,
exclusivement composé de copropriétaires, qui a pour mission de veiller à la
bonne exécution par le syndic de ses missions, sans préjudice de l'article
577-8/2.
A cet
effet, le conseil de copropriété peut prendre connaissance et copie, après en
avoir avisé le syndic, de toutes pièces ou documents se rapportant à la gestion
de ce dernier ou intéressant la copropriété.
Sous
réserve des compétences légales du syndic et de l'assemblée générale, le
conseil de copropriété peut recevoir toute autre mission ou délégation sur
décision de l'assemblée générale prise à la majorité des trois quarts des voix.
Une mission ou une délégation de l'assemblée générale ne peut porter que sur
des actes expressément déterminés et n'est valable que pour un an.
Le
conseil de copropriété adresse aux copropriétaires un rapport semestriel circonstancié
sur l'exercice de sa mission.
d) du montant des marchés et des contrats à partir duquel une mise
en concurrence est obligatoire, sauf les actes visés à l'article 577-8, § 4,
4°;
e)
moyennant une motivation spéciale, de l'exécution de travaux à certaines
parties privatives qui, pour des raisons techniques ou économiques, sera
assurée par l'association des copropriétaires.
Cette
décision ne modifie pas la répartition des coûts de l'exécution de ces travaux
entre les copropriétaires.
2°
à la majorité des quatre cinquième des voix :
a) de toute
autre modification aux statuts, en ce compris la modification de la répartition
des charges de copropriété;
b) de la modification de la destination de l'immeuble ou d'une partie de
celui-ci;
c) de la
reconstruction de l'immeuble ou de la remise en état de la partie endommagée en
cas de destruction partielle;
d) de toute acquisition des biens immobiliers destinés à devenir communs;
e) de tous
actes de disposition de biens immobiliers communs.
f) de la modification des statuts en fonction
de l'article 577-3, alinéa 4;
g) sans préjudice de l'article 577-3, alinéa
4, de la création d'associations partielles dépourvues de la personnalité
juridique, celles-ci pouvant uniquement préparer les décisions relatives aux
parties communes particulières indiquées dans la décision. Ces propositions de
décisions doivent être ratifiées lors de l'assemblée générale suivante.
En cas de destruction
totale ou partielle, les indemnités représentatives de l'immeuble détruit sont
affectées par priorités à la reconstruction lorsque celle-ci est décidée.
Sans préjudice des
actions exercées contre le propriétaire, l'occupant ou le tiers, responsable du
sinistre, les copropriétaires sont tenus, en cas de reconstruction ou de remise
en état, de participer aux frais en proportion de leur quote-part dans la
copropriété.
Il est statué à
l'unanimité des voix de tous les copropriétaires sur toute modification de la
répartition des quotes-parts de copropriété, ainsi que sur toute décision de
l'assemblée générale de reconstruction totale de l'immeuble.
Toutefois, lorsque
l'assemblée générale, à la majorité requise par la loi, décide de travaux ou
d'actes d'acquisition ou de disposition, elle peut statuer, à la même majorité,
sur la modification de la répartition des quotes-parts de copropriété dans les
cas où cette modification est nécessaire.
S'il est décidé de
la constitution d'associations partielles à la majorité requise par la loi, la
modification des quotités de la copropriété nécessaire en conséquence de cette
modification peut être décidée par l'assemblée générale à la même majorité.
B-SYNDIC
Nomination
Le syndic est élu par l'assemblée générale
qui fixera les conditions de sa nomination et éventuellement de sa révocation.
Elle pourra choisir le syndic parmi les
copropriétaires ou en dehors d'eux.
Si le syndic est absent ou défaillant, un
copropriétaire désigné par l'assemblée générale à la majorité absolue, au titre
de syndic provisoire, remplit ses fonctions.
Le mandat de syndic est renouvelable et ne
peut excéder trois ans.
Si le syndic est une société, l'assemblée
générale désignera en outre le ou les personnes physiques habilitées pour agir
en qualité de syndic.
Révocation -
Délégation - Syndic provisoire
L'assemblée générale peut en tout temps
révoquer le syndic.
Elle ne doit pas motiver sa décision. Elle
peut également lui adjoindre un syndic provisoire pour une durée ou à des
fins déterminées.
Publicité
La publicité quant à la nomination du syndic
se fera conformément à la loi.
Responsabilité
- Délégation
Le syndic est seul responsable de sa gestion.
Il ne peut déléguer ses pouvoirs sans
l'accord préalable de l'assemblée générale. Cette délégation ne peut intervenir
que pour une durée ou à des fins déterminées.
Attributions
du syndic
Le syndic a la charge de la gestion
journalière de l'immeuble et partant de sa surveillance générale.
C'est ainsi qu'il veillera au bon
fonctionnement de tout appareillage commun.
Il s'occupera des achats nécessaires et
veillera à ce que la gestion soit faite d'une manière économique.
Il sera souscrit de même, un contrat
d'entretien de toute autre installation qui requerrait un entretien régulier
par des spécialistes.
Il assurera le fonctionnement de tous les
services généraux (éclairage - chauffage - gaz - distribution d'eau -enlèvement
des immondices - nettoyage des couloirs et autres parties communes).
Tous travaux d'entretien ou de réparation
s'effectueront sous la surveillance du syndic ou, le cas échéant, d'un délégué
technique désigné par ce dernier.
Mandat du
syndic
L'association des copropriétaires délègue ses
pouvoirs au syndic qui la représente et est chargé d'exécuter et de faire
exécuter ses décisions, tant pour la gestion journalière que pour
l'administration de l’immeuble.
Il engage l'association des copropriétaires
pour toutes les questions courantes relevant des parties communes, vis-à-vis
des sociétés distributrices d'eau, de gaz et d'électricité, les fournisseurs
les plus divers, administrations, etcaetera…
Le syndic instruit les contestations
relatives aux parties communes vis-à-vis des tiers et des administrations
publiques.
Pouvoirs
Le syndic est chargé :
1.d'exécuter et de faire exécuter les
décisions prises par l'assemblée générale ;
2.d'accomplir tous actes conservatoires et
tous actes d'administration;
3.d'administrer les fonds de l'association
des copropriétaires; dans la mesure du possible, ces fonds doivent être
intégralement placés sur divers comptes, dont obligatoirement un compte
distinct pour le fonds de roulement et un compte distinct pour le fonds de
réserve; tous ces comptes doivent être ouverts au nom de l'association des
copropriétaires;
4.de représenter l'association des
copropriétaires, tant en justice que dans la gestion des affaires communes;
5.de fournir le relevé des dettes visées à
l'article 577-11, § 2, dans les trente jours de la demande qui lui en est faite
par le notaire;
6.de communiquer à toute personne occupant
l'immeuble en vertu d'un droit personnel ou réel mais ne disposant pas du droit
de vote à l'assemblée générale, la date des assemblées afin de lui permettre de
formuler par écrit ses demandes ou observations relatives aux parties communes
qui seront à ce titre communiquées à l'assemblée. La communication se fait par
affichage, à un endroit bien visible, dans les parties communes de l'immeuble.
7.de transmettre, si son mandat a pris fin
de quelque manière que ce soit, dans un délai de trente jours suivant la fin de
son mandat, l'ensemble du dossier de la gestion de l'immeuble à son successeur
ou, en l'absence de ce dernier, au président de la dernière assemblée générale,
y compris la comptabilité et les actifs dont il avait la gestion, tout
sinistre, un historique du compte sur lequel les sinistres ont été réglés,
ainsi que les documents prouvant l'affectation qui a été donnée à toute somme
qui ne se retrouve pas sur les comptes financiers de la copropriété;
8.de souscrire une assurance
responsabilité couvrant l'exercice de sa mission et de fournir la preuve de
cette assurance; en cas de mandat gratuit, cette assurance est souscrite aux
frais de l'association des copropriétaires;
9.de permettre aux copropriétaires d'avoir
accès à tous les documents ou informations à caractère non privé relatifs à la
copropriété, de toutes les manières définies dans le règlement de copropriété
ou par l'assemblée générale, et notamment par un site Internet;
10.de conserver, le cas échéant, le dossier
d'intervention ultérieure de la façon fixée par le Roi;
11.de présenter, pour la mise en
concurrence visée à l'article 577-7, § 1er, 1°, d) une pluralité de devis
établis sur la base d'un cahier des charges préalablement élaboré;
12.de soumettre à l'assemblée générale
ordinaire un rapport d'évaluation des contrats de fournitures régulières;
13.de solliciter l'autorisation préalable
de l'assemblée générale pour toute convention entre l'association des
copropriétaires et le syndic, ses préposés, ses proches, parents ou alliés
jusqu'au troisième degré inclus, ou ceux de son conjoint jusqu'au même degré;
il en est de même des conventions entre l'association des copropriétaires et
une entreprise dont les personnes susvisées sont propriétaires ou dans le
capital de laquelle elles détiennent une participation ou dans laquelle elles
exercent des fonctions de direction ou de contrôle, ou dont elles sont
salariées ou préposées; lorsqu'il est une personne morale, le syndic ne peut,
sans y avoir été spécialement autorisé par une décision de l'assemblée
générale, contracter pour le compte de l'association des copropriétaires avec
une entreprise qui détient, directement ou indirectement, une participation
dans son capital;
14.de tenir à jour la liste et les
coordonnées des personnes en droit de participer aux délibérations de
l'assemblée générale et de transmettre aux copropriétaires, à première demande
et au notaire s'il en fait la demande au syndic, dans le cadre de la
transcription d'actes qui sont transcrits à la conservation des hypothèques
conformément à l'article 1er, alinéa 1er, de la loi hypothécaire du 16 décembre
1851, les noms, adresses, quotités et références des lots des autres
copropriétaires;
15.de tenir les comptes de l'association
des copropriétaires de manière claire, précise et détaillée suivant le plan
comptable minimum normalisé à établir par le Roi. Toute copropriété de moins de
vingt lots à l'exclusion des caves, des garages et parkings est autorisée à
tenir une comptabilité simplifiée reflétant au minimum les recettes et les
dépenses, la situation de trésorerie ainsi que les mouvements des
disponibilités en espèces et en compte, le montant du fonds de roulement et du
fonds de réserve visés à l'article 577-11, § 5, alinéas 2 et 3, les créances et
les dettes des copropriétaires;
16.de préparer le budget prévisionnel pour
faire face aux dépenses courantes de maintenance, de fonctionnement et d'administration
des parties communes et équipements communs de l'immeuble, ainsi qu'un budget
prévisionnel pour les frais extraordinaires prévisibles; ces budgets
prévisionnels sont soumis, chaque année, au vote de l'association des
copropriétaires; ils sont joints à l'ordre du jour de l'assemblée générale
appelée à voter sur ces budgets.
Rémunération
Le mandat du syndic ou du syndic
provisoire est gratuit ou rémunéré.
L'assemblée générale fixe sa
rémunération éventuelle lors de sa nomination.
Celle-ci constitue une charge commune générale.
Démission
Le syndic peut en tout temps démissionner
moyennant un préavis de minimum trois mois, sans que celui-ci puisse sortir ses
effets avant l'expiration d'un trimestre civil.
Cette démission doit être notifiée par pli
recommandé transmis au conseil de gérance ou à défaut de celui-ci au président
de la dernière assemblée générale.

`
