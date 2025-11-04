
/**
 * BODY AGE ESTIMATOR UTILITY
 * 
 * This file contains the core logic for calculating a user's estimated body age
 * based on their BMI, age, and gender.
 */

/**
 * Calculates a user's estimated body age.
 * 
 * @param {number} age - User's actual age in years.
 * @param {string} gender - User's gender ("male" or "female").
 * @param {number} height - User's height in centimeters.
 * @param {number} weight - User's weight in kilograms.
 * @returns {number} The calculated body age, rounded to 1 decimal place.
 */
const calculateBodyAge = (age, gender, height, weight) => {
  // 1. Validate inputs
  if (!age || !gender || !height || !weight || height <= 0 || weight <= 0) {
    return null;
  }

  // 2. Calculate BMI (Body Mass Index)
  // Height is converted from cm to meters for the formula
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // 3. Calculate Body Fat Percentage using the provided formula
  let bodyFat;
  if (gender.toLowerCase() === "male") {
    bodyFat = 1.20 * bmi + 0.23 * age - 16.2;
  } else {
    // Assumes "female" or any other value as female for simplicity
    bodyFat = 1.20 * bmi + 0.23 * age - 5.4;
  }

  // 4. Calculate Body Age
  // The formula estimates body age based on the deviation from a baseline body fat of 18%
  const bodyAgeRaw = age + (bodyFat - 18) * 0.5;

  // 5. Return the result rounded to 1 decimal place
  // Ensure body age is not negative
  const finalBodyAge = Math.max(0, bodyAgeRaw);
  return Math.round(finalBodyAge * 10) / 10;
};

module.exports = { calculateBodyAge };
