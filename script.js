const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const loadingSpinner = document.createElement('div');
loadingSpinner.classList.add('loading-spinner');

// Replace with your Google Gemini API key
const API_KEY = 'AIzaSyCYaHQBkP4jw_0zoljKEbPyBRLb_mBbYQI';

// Event listeners
searchBtn.addEventListener('click', getMealList);
randomBtn.addEventListener('click', getRandomMeal);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Get meal list that matches with the ingredients
// Get meal list that matches with the ingredients
async function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();
    if (searchInputTxt === '') {
        alert('Please enter an ingredient!');
        return;
    }

    mealList.innerHTML = '';
    mealList.appendChild(loadingSpinner);
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `I need your help to prepare recipes with provided ingredients
following are the ingredient
${searchInputTxt}
I am expecting list the recipes which includes.

[
{
title: <recipe name>,
desc: <recipe desc>
preparationGuide:<array strings which explain step by step of how to cook the recipe>
ingredients:<list of array ingredients with measurement> 
}
} .`
                    }]
                }]
            })
        });
        const data = await response.json();
        loadingSpinner.style.display = 'none';

        if (data.candidates && data.candidates.length > 0) {
            // Clean the response to remove code block markers before parsing
            let rawJson = data.candidates[0].content.parts[0].text
                .replace(/```json/g, '')  // Remove starting ```json
                .replace(/```/g, '');      // Remove ending ```

            const recipeData = JSON.parse(rawJson); // Now parse the cleaned JSON
            let html = "";

            recipeData.forEach(recipe => {
                html += `
                    <div class="meal-item">
                        <div class="meal-name">
                            <h2>${recipe.title}</h2>
                            <p><strong>Description:</strong> ${recipe.desc}</p>
                            <h3>Ingredients:</h3>
                            <ul>
                                ${recipe.ingredients.map(ingredient => `<li>${ingredient[0]} - ${ingredient[1]}</li>`).join('')}
                            </ul>
                            <h3>Preparation Steps:</h3>
                            <ol>
                                ${recipe.preparationGuide.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                    </div>
                `;
            });

            mealList.innerHTML = html;
            mealList.classList.remove('notFound');
        } else {
            mealList.innerHTML = "Sorry, we didn't find any meal!";
            mealList.classList.add('notFound');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        mealList.innerHTML = "Failed to fetch recipes. Please try again later.";
        mealList.classList.add('notFound');
    }
}

// Get random meal
async function getRandomMeal() {
    mealList.innerHTML = '';
    mealList.appendChild(loadingSpinner);
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Provide a random recipe.`
                    }]
                }]
            })
        });

        const data = await response.json();
        loadingSpinner.style.display = 'none';

        if (data.candidates && data.candidates.length > 0) {
            // Extract recipe text from response
            const recipe = data.candidates[0].content.parts[0].text;  // Correctly access the recipe text
            mealDetailsContent.innerHTML = `
                <h2 class="recipe-title">Random Recipe</h2>
                <div class="recipe-instruct">
                    <h3>Instructions:</h3>
                    <p>${recipe}</p>
                </div>
            `;
            mealDetailsContent.parentElement.classList.add('showRecipe');
        } else {
            mealDetailsContent.innerHTML = "Failed to fetch a random recipe. Please try again later.";
            mealDetailsContent.parentElement.classList.add('showRecipe');
        }
    } catch (error) {
        console.error('Error fetching random meal:', error);
        mealDetailsContent.innerHTML = "Failed to fetch a random recipe. Please try again later.";
        mealDetailsContent.parentElement.classList.add('showRecipe');
    }
}

// Get meal recipe details
async function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        const mealName = e.target.parentElement.querySelector('h3').textContent;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                contents: [{
                    parts: [{
                        text: `Provide a detailed recipe for ${mealName}.`
                    }]
                }]
            });

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                const recipe = data.choices[0].text;
                mealDetailsContent.innerHTML = `
                    <h2 class="recipe-title">${mealName}</h2>
                    <div class="recipe-instruct">
                        <h3>Instructions:</h3>
                        <p>${recipe}</p>
                    </div>
                `;
                mealDetailsContent.parentElement.classList.add('showRecipe');
            } else {
                mealDetailsContent.innerHTML = "Failed to fetch recipe details. Please try again later.";
                mealDetailsContent.parentElement.classList.add('showRecipe');
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            mealDetailsContent.innerHTML = "Failed to fetch recipe details. Please try again later.";
            mealDetailsContent.parentElement.classList.add('showRecipe');
        }
    }
}