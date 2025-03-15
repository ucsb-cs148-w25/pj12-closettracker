## Closet Tracker

Log clothing use for tracking your clothes cleaning cycle.

#### Members

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
Before setting up Closet Tracker locally, ensure you have the following:

- **Node.js** (version > 20.0.0)
- **npm** installed
- API keys and configuration files (Contact the development team to obtain these))

#### Installation & Setup

1. **Clone the repository**
   ```sh
   git clone git@github.com:ucsb-cs148-w25/pj12-closettracker.git
   cd pj12-closettracker/closet-tracker
   ```

2. **Install dependencies**
   ```npm install```

3. **Set up configuration files**

Obtain the required API keys and config files from the development team.
Place them in the appropriate locations as specified in the team’s setup guide.

4. **Start the application**
   ```npx expo start```

You will see options to:

- Run on an Android emulator
- Run on an iOS simulator
- Open using Expo Go

#### Deployment Notes

- The app currently runs locally and is not deployed to a cloud platform.
Ensure you keep your API keys and config files private.
- Reach out to our team for configuration files and API keys.

#### Dependencies

- react-native: for native app development
- expo: mobile app development package with more features
- supabase: for uploading images
- firebase: for authentication and storage
- base64-arraybuffer: for converting images to base64 and back
- expo-image-picker: for uploading images and taking pictures

### Functionality

- Authentication
    - Sign up
    - Sign in
    - Sign out
- Upload clothing images
    - Upload from camera roll
    - Take a picture from camera
    - Remove background, name and categorize clothing, add tags
- Wardrobe
    - Select singular or multiple wardrobe items
    - View and edit the details of singular wardrobe items
    - Increment the wear count of wardrobe items, watch the background color turn more brown with more wears
    - Move (multiple) wardrobe items to laundry or delete them
 - Laundry
    - View all items in the laundry
    - Items in laundry cannot be used to create outfits
    - Move items back to wardrobe, and find that their wear counts have reset to 0
 - Outfits
    - Create new outfit by multi-selecting clothing items
    - Arrange clothing items, resize them, adjust layers, and add your profile picture
    - View all outfits previously made and saved
    - Make outfits public to all users or private for yourself
 - Home page
    - See other users' outfits and like them
    - Wash all clothes currently in your laundry
 - User page
    - Upload profile picture, add bio/description
    - Sign out
