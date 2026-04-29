# Set up Tuumik locally for development

These instructions show how to run Tuumik and Tuumik Export on a local machine in a development environment. This is only for development purposes and testing. You should not run Tuumik like this for production use.

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

In the following steps we will extract Tuumik to /tuumik/app and Tuumik Export to /tuumik/export.

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

**3.1. Download Tuumik**

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

## 4. Update export URLs in Tuumik and test

**4.1. Create a new demo in Tuumik**

Open http://localhost:3000/start-demo in the browser and click the "Start Demo" button. In a few seconds you should be automatically logged into Tuumik with a demo account that contains randomly generated sample data.

**4.2. Update exporter URLs**

In the Tuumik app go to /admin/exporters and update exporter URLs. Instead of http://export:3000 use http://localhost:3009 in URLs.

**4.3. Test exporting data**

In Tuumik go to Timesheet Explorer, click Search and select some timesheet entries. Then from bottom right on screen click Export and try to export to XLSX or PDF. You should be able to download generated files.

## 5. Changes to code and use of AI

**5.1. Changes to code**

You are now ready to modify code in /tuumik/app or /tuumik/export. If any code is changed, the relevant app will automatically reload and you should see the changes locally.

**5.2. Using AI tools**

If you are using an agentic AI coding tool, then it is recommended to start it in the /tuumik directory. This way the tool will have access to both Tuumik in /app and Tuumik Export in /export.

## 6. Deployment

- [Instructions on how to deploy Tuumik and Tuumik Export in production](deployment.md#deployment-via-docker)
- [Instructions on how to save and deploy custom Docker images of Tuumik and Tuumik Export](deployment.md#create-and-deploy-custom-versions)
