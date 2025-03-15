## Closet Tracker

Log clothing use for tracking your clothes cleaning cycle.

#### Members

- name: git_hub_ID
- Gen Tamada: Ononymous
- Sophia Tran: sophiattran
- Daisy Zhong: daisyzhongg
- Gretchen Lam: gretchenlam
- Anvitha Kosuri: AnvithaKosuri
- Andrew Chen: andrewc512
- Victor Nardi: vcnardi524

#### About our App

Closet Tracker is a mobile application developed with Expo Go and React Native that helps users organize and manage their wardrobes efficiently.

Closet Tracker allows users to track clothing items, plan outfits, and gain a better idea of which clothes need to be cleaned. The app is designed for individuals who want to stay organized and make the most of their clothing collection. Users can log their wardrobe by adding pictures of their clothing, and the app will organize the items according to color, category, etc. The app will also recommended outfits depending on various factors such as weather and calendar events. The user will be able to visualize these outfits on a virtual avatar to ensure they are satisfied with the items. Regular users can add, edit, and delete wardrobe items, plan outfits, and track their clothing usage. Currently, we have no plans to include users with different permissions.

The frontend of the app will rely on React Native with Expo Go to ensure compatibality with mobile devices. We also plan on using Firebase for user authentication and database management.

### Deployment

#### Prerequisites

- [Node.js](https://nodejs.org/en/download/): JavaScript runtime (> v20.0.0)

#### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start --tunnel
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

#### Dependencies

- react-native: for native app development
- expo: mobile app development package with more features
- supabase: for uploading images
- firebase: for authentication and storage
- base64-arraybuffer: for converting images to base64 and back
- expo-image-picker: for uploading images and taking pictures

### Functionality

- Authentication
    - sign in
    - sign up 
    - sign out
- Upload clothing images
    - upload from camera roll
    - Take a picture from camera
    - Naming and categorizing clothing, adding tags
- Wardrobe
    - select wardrobe item
    - select multiple wardrobe items
    - delete (multiple) wardrobe items

### Known Problems

- Not enough color choices when uploading new clothing
    - remove background of images when uploading
- Outfit page not implemented
    - outfit suggester
    - virtual avatar to visualize outfits
- Clothings are not sorted by time in wardrobe
    - track laundry + laundry page
    - No way to track clothing usage
