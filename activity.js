// 1. create an array of objects with firstname, lastname, and age properties 10 kabuok
const myArray = [
  { firstname: "John", lastname: "Doe", age: 25 },
  { firstname: "Jane", lastname: "Smith", age: 19 },
  { firstname: "Mike", lastname: "Johnson", age: 30 },
  { firstname: "Emily", lastname: "Davis", age: 18 },
  { firstname: "David", lastname: "Brown", age: 22 },
  { firstname: "Sarah", lastname: "Miller", age: 17 },
  { firstname: "Chris", lastname: "Wilson", age: 28 },
  { firstname: "Jessica", lastname: "Moore", age: 21 },
  { firstname: "Daniel", lastname: "Taylor", age: 16 },
  { firstname: "Laura", lastname: "Anderson", age: 24 },
];

// Filter the array to include only those with age below 20
const filteredArray = myArray.filter((person) => person.age < 20);

// 3. display the filtered array in console
filteredArray.forEach((peron) => console.log(person));

// 4. create a function that takes an array of objects and returns the average age of the filtered array

// 5. Create a markup generator function that takes an object and returns a string of HTML markup with the object's properties displayed in a card format
