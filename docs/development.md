# Set up Tuumik locally for development

These instructions show how to run Tuumik, Tuumik Export and Tuumik MCP on a local machine in a development environment. This is only for development purposes and testing. You should not run Tuumik like this for production use.

- The instructions show setting up Tuumik on Linux
- For Macs, the process is very similar, except installing Node Version Manager via Homebrew
- For Windows it is strongly recommended to use WSL 2 to run Tuumik

## 1. Prepare environment

**1.1. Install Node Version Manager (NVM)**

```shell
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

**1.2. Install and select Node v22 via NVM**

```shell
nvm install 22
nvm use 22
```

**1.3. Install Meteor**

```shell
npx meteor
```

**1.4. Create project directory**

```shell
mkdir tuumik
```

In the following steps we will extract Tuumik to /tuumik/app, Tuumik Export to /tuumik/export and Tuumik MCP to /tuumik/mcp.

## 2. Set up Tuumik

**2.1. Download Tuumik**

You can download the latest release of Tuumik from https://github.com/tuumiksystems/tuumik/releases

**2.2. Extract Tuumik**

Extract Tuumik release to /tuumik/app directory.

**2.3. In /tuumik/app directory copy the deploy-examples directory to .deploy**

In /tuumik/app run this command:

```shell
cp -r deploy-examples .deploy
```

Notice the dot in ".deploy". It is important not to omit it.

**2.4. Install npm dependencies**

In /tuumik/app run this command:

```shell
meteor npm install
```

**2.5. Start app**

In /tuumik/app run this command:

```shell
meteor npm run local:demo
```

**2.6. Open http://localhost:3000 in the browser**

When you open http://localhost:3000 in the browser you should see Tuumik's login page.

## 3. Set up Tuumik Export

**3.1. Download Tuumik Export**

You can download the latest release of Tuumik Export from https://github.com/tuumiksystems/tuumik-export/releases

**3.2. Extract Tuumik Export**

Extract Tuumik Export release to /tuumik/export directory.

**3.3. In /tuumik/export directory create an .env file from .env.example**

In /tuumik/export run this command:

```shell
cp .env.example .env
```

**3.4. Install npm dependencies**

In /tuumik/export run this command:

```shell
npm install
```

**3.5. Start app**

In /tuumik/export run this command:

```shell
npm run start:dev
```

**3.6. Open http://localhost:3009 in the browser**

When you open http://localhost:3009 in the browser you should see "Tuumik Export".

## 4. Set up Tuumik MCP

**4.1. Download Tuumik MCP**

You can download the latest release of Tuumik MCP from https://github.com/tuumiksystems/tuumik-mcp/releases

**4.2. Extract Tuumik MCP**

Extract Tuumik MCP release to /tuumik/mcp directory.

**4.3. In /tuumik/mcp directory create an .env file from .env.example**

In /tuumik/mcp run this command:

```shell
cp .env.example .env
```

**4.4. Install npm dependencies**

In /tuumik/mcp run this command:

```shell
npm install
```

**4.5. Start app**

In /tuumik/mcp run this command:

```shell
npm run start:dev
```

**4.6. Open http://localhost:3100/hello in the browser**

When you open http://localhost:3100/hello in the browser you should see "Tuumik MCP".

## 5. Update export URLs in Tuumik and test Tuumik Export

**5.1. Create a new demo in Tuumik**

Open http://localhost:3000/start-demo in the browser and click the "Start Demo" button. In a few seconds you should be automatically logged into Tuumik with a demo account that contains randomly generated sample data.

**5.2. Update exporter URLs**

In the Tuumik app go to /admin/exporters and update exporter URLs. Instead of http://export:3000 use http://localhost:3009 in URLs.

**5.3. Test exporting data**

In Tuumik go to Timesheet Explorer, click Search and select some timesheet entries. Then from bottom right on screen click Export and try to export to XLSX or PDF. You should be able to download generated files.

## 6. Create API key in Tuumik and test Tuumik MCP

**6.1. Create a new demo in Tuumik (if not already created)**

Open http://localhost:3000/start-demo in the browser and click the "Start Demo" button. In a few seconds you should be automatically logged into Tuumik with a demo account that contains randomly generated sample data.

**6.2. Create API key**

In the Tuumik app go to /settings and create a new API key.

**6.3. Add MCP server to AI tool with API key**

In your AI tool add the MCP server at http://localhost:3100/mcp. Also make sure the MCP server queries to the Tuumik app will use the API key you created.

**6.4. Test MCP server**

Your AI tool should now be able to communicate with Tuumik. You can test this by asking the AI tool "What is my name in Tuumik?".

## 7. Changes to code and use of AI

**7.1. Changes to code**

You are now ready to modify code in /tuumik/app or /tuumik/export. If any code is changed, the relevant app will automatically reload and you should see the changes locally.

**7.2. Using AI tools**

If you are using an agentic AI coding tool, then it is recommended to start it in the /tuumik directory. This way the tool will have access to all parts of Tuumik in /app, /export and /mcp.

## 8. Deployment

- [Instructions on how to deploy Tuumik and Tuumik Export in production](deployment.md#deployment-via-docker)
- [Instructions on how to save and deploy custom Docker images of Tuumik and Tuumik Export](deployment.md#create-and-deploy-custom-versions)
