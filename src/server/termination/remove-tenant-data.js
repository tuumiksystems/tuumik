import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { Tenant, Times, Statuses, Clients, Projects, TaskGroups, OauthClients, OauthCodes, OauthGrants } from '/src/shared/collections/collections';

const { client: mongoClient } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const removeTenantData = async () => {
  const session = mongoClient.startSession();
  session.startTransaction();

  try {
    await Times.rawCollection().deleteMany({}, { session });
    await Statuses.rawCollection().deleteMany({}, { session });
    await Clients.rawCollection().deleteMany({}, { session });
    await Projects.rawCollection().deleteMany({}, { session });
    await TaskGroups.rawCollection().deleteMany({}, { session });
    await OauthClients.rawCollection().deleteMany({}, { session });
    await OauthCodes.rawCollection().deleteMany({}, { session });
    await OauthGrants.rawCollection().deleteMany({}, { session });
    await Tenant.rawCollection().deleteMany({}, { session });
    await Meteor.users.rawCollection().deleteMany({}, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Transaction error occurred terminating organization', error);

    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

export default removeTenantData;
