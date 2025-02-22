## Unit test experimentation February 14, 2025 
We used the Jest testing library to add unit tests for our `UploadClothingComponent`.
The tests first verified that the single item's data was displayed correctly on the screen. Then, they checked that interacting with the text input and clicking submit successfully updated the database.

As a team, we will write minimal unit tests as the project is very volatile at the moment but we will implement unit tests for core features that we deem essential to the viability of our product. Instead of many potentially unnecessary unit tests, we will ensure we have thorough documentation. 

## Component test experimentation February 21, 2025 
We used the Jest testing library to add unit tests for our `UploadClothingComponent` in our editItem page.
The tests first verified that the editItem page was rendered. The second test checks whether the clothingDataDropdowns are properly rendered on our page. Further testing can be done to check functionality. 

Going forward our plan is to expand upon our current component and integration tests to make them more robust. Although we don't have an immediate need for extensive component tests we would like the existing ones to serve as a basis for future tests and hence we have deemed it critical that we should expand upon the current tests for the editItem page. We would like to explore new frameworks and technologies for integrated testing that might work with our tech stack better. 



The unit test can be found in folder: closet-tracker/components/__tests__/ClothingDataDropdowns.test.tsx
The component test can be found in folder: closet-tracker/components/__tests__/editItem_components.test.tsx
