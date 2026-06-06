// Configuration du mode Aventure
const adventureConfig = {
    passPercentage: 80,
    levels: [
        {
            id: 1,
            title: "Les couleurs renversées",
            icon: "🌈",
            numberofQuestions: 10,
            categories: ["colours"]
        },
        {
            id: 2,
            title: "Le calendrier perdu",
            icon: "📅",
            numberofQuestions: 10,
            categories: ["days","months"]
        },
        {
            id: 3,
            title: "La tempête des émotions",
            icon: "🌪️",
            numberofQuestions: 10,
            categories: ["weather","feelings"]
        },
        {
            id: 4,
            title: "Les animaux magiques",
            icon: "🐶",
            numberofQuestions: 10,
            categories: ["pets"]
        },
        {
            id: 5,
            title: "La barrière de l'école",
            icon: "🎒",
            numberofQuestions: 10,
            categories: ["school","transport"]
        },
        {
            id: 6,
            title: "L'épreuve ultime",
            icon: "🏰",
            numberofQuestions: 20,
            categories: [
                "colours",
                "days",
                "months",
                "weather",
                "feelings",
                "pets",
                "school",
                "transport"
            ]
        }
    ]
};
