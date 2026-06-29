import { Meteor } from 'meteor/meteor';
import { MongoInternals } from 'meteor/mongo';
import { Tenant, Times, Statuses, Clients, Projects, TaskGroups } from '/src/shared/collections/collections';

const { client: mongoClient } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const removeTenantData = async () => {
  const session = mongoClient.startSession();
  session.startTransaction();

  try {
    await Times.rawCollection().remove({}, { session });
    await Statuses.rawCollection().remove({}, { session });
    await Clients.rawCollection().remove({}, { session });
    await Projects.rawCollection().remove({}, { session });
    await TaskGroups.rawCollection().remove({}, { session });
    await Tenant.rawCollection().remove({}, { session });
    await Meteor.users.rawCollection().remove({}, { session });

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
