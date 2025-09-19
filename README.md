NOTE!! 90% of this is VIBE CODED, judge it as you will

the purpose of this project is to create practice quizzes for any subject that the user wants
albeit this needs to be manually set up and alter templated code


this assumes you have experience in programming 

How to use:

STEP 1
In index.html add add this code block below inside const quizzes just as follows

code block:
            {
                title: "Insert Any Title",
                description: "Insert Any Description",
                difficulty: "Insert Any Difficulty",
                questions: 0, //Insert Any Number
                url: "INSERT_PROPER_URL.html",
                category: "Insert Any Category"
            },


inside index.html

        const quizzes = [
            {
                title: "Sample Quiz Template",
                description: "A demo quiz showing different question types",
                difficulty: "Easy",
                questions: 10,
                url: "quiz-template.html",
                category: "General"
            },
            //add any amout of code blocks here 
            {
                title: "Insert Any Title",
                description: "Insert Any Description",
                difficulty: "Insert Any Difficulty",
                questions: 0, //Insert Any Number
                url: "INSERT_PROPER_URL.html",
                category: "Insert Any Category"
            },
        ];


STEP 2
Create a new html file with the same file name from the code block (INSERT_PROPER_URL.html)
copy the contents of quiz-template.html into the created html file

to create the different questions use the code blocks that are seen with questions:
similar to what we did earlier with index.html


STEP 3
enjoy learning


