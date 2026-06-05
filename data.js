
const dictionaryWords = [
    { word: "Red", fr: "Rouge", cat: "colours" },
    { word: "Blue", fr: "Bleu", cat: "colours" },
    { word: "Green", fr: "Vert", cat: "colours" },
    { word: "Yellow", fr: "Jaune", cat: "colours" },
    { word: "Pink", fr: "Rose", cat: "colours" },
    { word: "Black", fr: "Noir", cat: "colours" },
    { word: "Orange", fr: "Orange", cat: "colours" },
    { word: "White", fr: "Blanc", cat: "colours" },

    { word: "Monday", fr: "Lundi", cat: "days" },
    { word: "Tuesday", fr: "Mardi", cat: "days" },
    { word: "Wednesday", fr: "Mercredi", cat: "days" },
    { word: "Thursday", fr: "Jeudi", cat: "days" },
    { word: "Friday", fr: "Vendredi", cat: "days" },
    { word: "Saturday", fr: "Samedi", cat: "days" },
    { word: "Sunday", fr: "Dimanche", cat: "days" },

    { word: "January", fr: "Janvier", cat: "months" },
    { word: "February", fr: "Février", cat: "months" },
    { word: "March", fr: "Mars", cat: "months" },
    { word: "April", fr: "Avril", cat: "months" },
    { word: "May", fr: "Mai", cat: "months" },
    { word: "June", fr: "Juin", cat: "months" },
    { word: "July", fr: "Juillet", cat: "months" },
    { word: "August", fr: "Août", cat: "months" },
    { word: "September", fr: "Septembre", cat: "months" },
    { word: "October", fr: "Octobre", cat: "months" },
    { word: "November", fr: "Novembre", cat: "months" },
    { word: "December", fr: "Décembre", cat: "months" },

    { word: "Spring", fr: "Printemps", cat: "seasons" },
    { word: "Summer", fr: "Été", cat: "seasons" },
    { word: "Autumn", fr: "Automne", cat: "seasons" },
    { word: "Winter", fr: "Hiver", cat: "seasons" },

    { word: "Happy", fr: "Joyeux", cat: "feelings" },
    { word: "Fine", fr: "Bien", cat: "feelings" },
    { word: "Sad", fr: "Triste", cat: "feelings" },
    { word: "Shy", fr: "Timide", cat: "feelings" },
    { word: "Angry", fr: "En colère", cat: "feelings" },
    { word: "In love", fr: "Amoureux", cat: "feelings" },

    { word: "Dog", fr: "Chien", cat: "pets" },
    { word: "Cat", fr: "Chat", cat: "pets" },
    { word: "Rabbit", fr: "Lapin", cat: "pets" },
    { word: "Fish", fr: "Poisson", cat: "pets" },

    { word: "Sunny", fr: "Ensoleillé", cat: "weather" },
    { word: "Cloudy", fr: "Nuageux", cat: "weather" },
    { word: "Foggy", fr: "Brumeux", cat: "weather" },
    { word: "Stormy", fr: "Orageux", cat: "weather" },
    { word: "Rainy", fr: "Pluvieux", cat: "weather" },

    { word: "By car", fr: "En voiture", cat: "transport" },
    { word: "By bus", fr: "En bus", cat: "transport" },
    { word: "On foot", fr: "À pied", cat: "transport" },
    { word: "By bike", fr: "À vélo", cat: "transport" },

    { word: "Pencil", fr: "Crayon", cat: "school" },
    { word: "Pen", fr: "Stylo", cat: "school" },
    { word: "Pencil case", fr: "Trousse", cat: "school" },
    { word: "Eraser pen", fr: "Stylo effaçable", cat: "school" },
    { word: "Pencil sharpener", fr: "Taille-crayon", cat: "school" },
    { word: "Ruler", fr: "Règle", cat: "school" },
    { word: "Schoolbag", fr: "Cartable", cat: "school" }
];

const dictionaryQuestions = [
    { 
        question: "Who are you?", 
        answers: [
            "I am Alix.", 
            "My name is Jul."] 
    }, {
        question: "Are you a boy or a girl?",
        answers: [
            "I am a girl.",
            "I am a boy."
        ]
    },{
        question: "How old are you?",
        answers: [
            "I am 8 years old.",
            "I am 9 years old.",
            "I am 10 years old."
        ]
    },{
        question: "What's your favourite colour?",
        answers: [
            "My favourite colour is red.",
            "My favourite colour is blue.",
            "My favourite colour is green.",
            "My favourite colour is yellow.",
            "My favourite colour is pink.",
            "My favourite colour is black.",
            "My favourite colour is white.",
            "My favourite colour is orange."
        ]
    },{
        question: "What have you got in your schoolbag?",
        answers: [
            "I have got one ruler in my schoolbag.",
            "I have got two pencils in my schoolbag.",
            "I have got one rubber in my schoolbag.",
            "I have got one pencil case in my schoolbag.",
            "I have got one ruler and two pencils in my schoolbag."
        ]
    },{
        question: "What do you have in your schoolbag?",
        answers: [
            "I have got one ruler in my schoolbag.",
            "I have got two pencils in my schoolbag.",
            "I have got one rubber in my schoolbag.",
            "I have got one pencil case in my schoolbag.",
            "I have got one ruler and two pencils in my schoolbag."
        ]
    },{
        question: "How do you go to school?",
        answers: [
            "I go to school by bike.",
            "I go to school by car.",
            "I go to school on foot.",
            "I go to school by bus."
        ]
    },{
        question: "What is your favourite day?",
        answers: [
            "My favourite day is Monday.",
            "My favourite day is Tuesday.",
            "My favourite day is Wednesday.",
            "My favourite day is Thursday.",
            "My favourite day is Friday.",
            "My favourite day is Saturday.",
            "My favourite day is Sunday."
        ]
    },{
        question: "What is your favourite month?",
        answers: [
            "My favourite month is January.",
            "My favourite month is February.",
            "My favourite month is March.",
            "My favourite month is April.",
            "My favourite month is May.",
            "My favourite month is June.",
            "My favourite month is July.",
            "My favourite month is August.",
            "My favourite month is September.",
            "My favourite month is October.",
            "My favourite month is November.",
            "My favourite month is December."
        ]
    },{
        question: "What is your favourite season?",
        answers: [
            "My favourite season is spring.",
            "My favourite season is summer.",
            "My favourite season is autumn.",
            "My favourite season is winter."
        ]
    },{
        question: "When is your birthday?",
        answers: [
            "My birthday is in January.",
            "My birthday is in February.",
            "My birthday is in March.",
            "My birthday is in April.",
            "My birthday is in May.",
            "My birthday is in June.",
            "My birthday is in July.",
            "My birthday is in August.",
            "My birthday is in September.",
            "My birthday is in October.",
            "My birthday is in November.",
            "My birthday is in December."
        ]
    },{
        question: "What is the weather like today?",
        answers: [
            "It is sunny today.",
            "It is rainy today.",
            "It is cloudy today.",
            "It is foggy today.",
            "It is stormy today.",
            "It is windy today.",
            "It is snowy today.",
            "It is cold today.",
            "It is hot today.",
            "It is sunny and hot today.",
            "It is cloudy and cold today."
        ]
    },{
        question: "Is it sunny today?",
        answers: [
            "Yes, it is.",
            "No, it isn't."
        ]
    },{
        question: "How do you feel today?",
        answers: [
            "Today I feel fine.",
            "Today I feel happy.",
            "Today I feel sad.",
            "Today I feel angry.",
            "Today I feel in love.",
            "Today I feel ill.",
            "Today I feel tired.",
            "Today I feel shy.",
            "Today I feel surprised."
        ]
    },{
        question: "How are you today?",
        answers: [
            "Today I feel fine.",
            "Today I feel happy.",
            "Today I feel sad.",
            "Today I feel angry.",
            "Today I feel in love.",
            "Today I feel ill.",
            "Today I feel tired.",
            "Today I feel shy.",
            "Today I feel surprised."
        ]
    },{
        question: "Have you got a pet?",
        answers: [
            "Yes, I have got a dog.",
            "Yes, I have got a cat.",
            "Yes, I have got an eagle.",
            "Yes, I have got a hamster.",
            "Yes, I have got a rabbit.",
            "Yes, I have got a mouse.",
            "Yes, I have got a horse.",
            "No, I don't have a pet."
        ]
    },{
        question: "What is your favourite animal?",
        answers: [
            "My favourite animal is the dog.",
            "My favourite animal is the cat.",
            "My favourite animal is the eagle.",
            "My favourite animal is the hamster.",
            "My favourite animal is the rabbit.",
            "My favourite animal is the mouse.",
            "My favourite animal is the horse."
        ]
    },{
        question: "Would you like to go to the museum?",
        answers: [
            "Yes I'd love to.",
            "No, sorry I'm Ill"
        ]
    }

];