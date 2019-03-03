const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require("@config/keys");

const client = redis.createClient(keys.redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function() {
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function() {

    if( ! this.useCache ) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );
    
    const cacheValue = await client.get(key);

    if(cacheValue) {
        
        const doc = JSON.parse(cacheValue);

        const converted = (
            Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc)
        );

        return converted;
    }

    const result = await exec.apply(this, arguments);
    
    client.set(key, JSON.stringify(result));

    return result;
}