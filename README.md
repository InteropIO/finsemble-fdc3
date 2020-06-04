# Finsemble Copy Repo
This will take your components and add them to the Finsemble Seed project, this will allow you to keep a seperate repo from the seed project.

## How it works:
The project watches for any changes in the src directory, when folders or files are added or removed this will reflect in the Finsemble Seed Project. *Finsemble.Config.json* is also observed for changes and will also update the seed project's main config file.

## How to use:
1) Clone this repo
   - **our advise:** make a parent folder for this repo to house both this project and step 2 (Seed project)
2) Clone the seed-project found here TODO: link to seed
3) Open **finsemble.config.json** and update `seedProjectDirectory` with the path to the Finsemble Seed Project that you cloned in step 2
4) Run `npm run watch`
5) Start adding your own services, components or preloads. See the next sub sections on how to structure them.
6) When you create a new service, preload or component you need to add it to the `importConfig` in the *finsemble.config.json* file
7) *important* if you add any additional node packages you will need to manually add them in the seed project too, we recommend adding both at the same time to avoid issues.

### Adding a Preload:
A simple preload has been included in this repo, you can copy this folder and replace it with your preload details.
Preload folder structure - these are the minimum files that you need and are required!

- Preload file (example file formats .js, .ts)
- Webpack file (needs to have an entry that references the preload file above with the same name and extension)

### Adding a Component:

- config.json (this tells Finsemble how to display and use your component, find out more here: TODO:insert doc link )
- HTML file (components are web pages therefore need a HTML page)
- index.js (this does not have to be named index and can be .js, .ts, .jsx, .tsx etc)
- Webpack file ( this needs to have an entry that points to your index file from the step above and needs to be the same name and extension)


### Adding a Service:

- config.json (this tells Finsemble how to display and use your component, find out more here: TODO:insert doc link ).
**This is not the same format as the component config above.**
- HTML file (services are web pages therefore need a HTML page)
- index.js (this does not have to be named index and can be .js, .ts, .jsx, .tsx etc)
- Webpack file ( this needs to have an entry that points to your index file from the step above and needs to be the same name and extension)


## Remote Hosted components:
If you already have components hosted as web applications you can do the following:

### CORS enabled server:
**Services & components:**
- Ensure the hosted files are running. This will look the same as the example services and templates in this repo.
- Get the URL for your component/service *config.json*
- Add the URL to the *finsemble.config.json* to the `importConfig` section

**Preloads:**
- Use the URL to your preload file. Add to the trusted preload section. TODO: add config for this?

### Server without CORS:
**Services & components:**
- Like a local component or service create a folder and include a *config.json* file and a blank *index.js* file
- Get the URL for your component/service html file and add it to your local *config.json*
- Add the path to your local component/service folder to the *finsemble.config.json* to the `importConfig` section

**Preloads:**
*same as with CORS enabled