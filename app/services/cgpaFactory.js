"use strict";

angular
    .module("cgpaCalculator")
    .factory("cgpaFactory", function($http) {

        function getGradePoints() {
            var gradePoints = {"A+" : 4.0,"A" : 4.0, "A-" : 3.7, "B+" : 3.3, "B" : 3.0,
                "B-" : 2.7, "C+" : 2.3, "C" : 2.0, "C-" : 1.7, "D+" : 1.3, "D" : 1.0, "E" : 0.0,
                "AB" : 0.0};

            return gradePoints;
        }

        function getGrades() {
            var grades = getGradePoints();

            return Object.keys(grades);
        }

        function getCreditHours() {
            return [8,6,4, 3, 2, 1, 0];
        }

        function getStanding(data, gradeType) {
            if (isNaN(data[gradeType])) {
                return data;
            }

            if (data[gradeType] >= 3.7) {
                data[gradeType + "Standing"] = "First Class";
                data[gradeType + "Animation"] = true;
                data[gradeType + "ProgressBar"] = "progress-bar-success";
            } else if (data[gradeType] >= 3.3 && data[gradeType] < 3.7) {
                data[gradeType + "Standing"] = "Second Upper Class";
                data[gradeType + "Animation"] = true;
                data[gradeType + "ProgressBar"] = "progress-bar-info";
            } else if (data[gradeType] >= 3.0 && data[gradeType] < 3.3) {
                data[gradeType + "Standing"] = "Second Lower Class";
                data[gradeType + "Animation"] = true;
                data[gradeType + "ProgressBar"] = "progress-bar-info";
            } else if (data[gradeType] >= 2.0 && data[gradeType] < 3.0) {
                data[gradeType + "Standing"] = "You can get Degree.";
                data[gradeType + "ProgressBar"] = "progress-bar-warning";
            } else {
                data[gradeType + "Standing"] = "Not Good standing - You Can't get your Degree.";
                data[gradeType + "ProgressBar"] = "progress-bar-danger";
            }

            data[gradeType + "ProgressBarWidth"] = (data[gradeType] / 4.00) * 100;
            return data;
        }

        function calculateGPA(data) {
            var gradePoints = getGradePoints();
            var result = {"totalCredits" : 0, "gpa" : 0, "gradePoint" : 0};
            var dataKey;

            for (dataKey in data) {
                if (!data.hasOwnProperty(dataKey) || data[dataKey] === null) {
                    continue;
                }

                if ("hour" in data[dataKey] && "grade" in data[dataKey]) {
                    if (!["W", "WP"].includes(data[dataKey].grade)) {
                        var credit = gradePoints[data[dataKey].grade] * data[dataKey].hour;
                        result["totalCredits"] += data[dataKey].hour;
                        result["gradePoint"] += credit;
                    }
                }
            }

            result["gpa"] = (result["gradePoint"] / result["totalCredits"]).toFixed(4).slice(0, -2);
            result = getStanding(result, "gpa");
            return result;
        }

        function calculateGPAExpected(data, result) {
            var totalGradePoint = data["creditsCompleted"] * data["cgpa"];
            var expectedTotalGradePoint = data["cgpaExpected"]
            * (data["currentCredits"] + data["creditsCompleted"]);

            result["gpaExpected"] = ((expectedTotalGradePoint - totalGradePoint)
            / data["currentCredits"]).toFixed(4).slice(0, -2);
            return result
        }

        function calculateCGPA(data, result) {
            var totalCredits = result["totalCredits"] + data["creditsCompleted"];
            var totalGradePoint = (data["creditsCompleted"] * data["cgpa"])
            + result["gradePoint"];

            result["cgpaCalculated"] = (totalGradePoint / totalCredits).toFixed(4).slice(0, -2);
            result = getStanding(result, "cgpaCalculated")
            if ("currentCredits", "cgpaExpected" in data) {
                result = calculateGPAExpected(data, result);
            }

            return result;
        }

        function calculateGrades(data) {
            var result = calculateGPA(data.rows);

            if ("cgpa" in data && "creditsCompleted" in data && data["cgpa"] <= 4
                && data["creditsCompleted"] > 0) {
                result = calculateCGPA(data, result);
            }

            result["gradePoint"] = result["gradePoint"].toFixed(4).slice(0, -2)
            return result;
        }

        return {
            getGradePoints : getGradePoints,
            getGrades : getGrades,
            getCreditHours : getCreditHours,
            calculateGrades : calculateGrades
        }

    });