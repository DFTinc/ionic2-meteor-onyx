export interface IFingerprint {
    userId:String,
    template:String
}
export var Fingerprints = new Mongo.Collection<IFingerprint>('fingerprints');


if (Meteor.isServer) {
    Fingerprints.allow({
        insert: function (userId, doc) {
            return false;
        },

        update: function (userId, doc, fieldNames, modifier) {
            return false;
        },

        remove: function (userId, doc) {
            return false;
        }
    });

    Fingerprints.deny({
        insert: function (userId, doc) {
            return true;
        },

        update: function (userId, doc, fieldNames, modifier) {
            return true;
        },

        remove: function (userId, doc) {
            return true;
        }
    });
}
