const { createHttpLink } = require('apollo-link-http');
const { execute, makePromise } = require('apollo-link');
const fetch = require('node-fetch');
const gql = require('graphql-tag');
const uri = 'https://dev.api.cryptobadge.app/can-keys-test/graphql';
const link = createHttpLink({ uri, fetch });

const CanPass =  require('can-pass-js');
const store = 'localStore';

// CANpass integration
const clientID = '29db89d6ee2a4bbcb8a043106ead790f';


CanPass.default.init({
  clientId: clientID,
  version: 'v1.0',
  endPoint: 'https://pro.api.cryptobadge.app/can-keys-dev/graphql',
  signTxURL: 'https://canpass.me/auth/sign-transaction',
  logger: console,
  store: store,
});

const operation = {
    query: gql`
        mutation {
            requestSignTransaction(
                input: {
                transaction: {
                    actions: {
                        account: "eosio.token"
                        name: "transfer"
                        authorization: { actor: "kgohocpz2p3u", permission: "active" }
                        data: {
                            from: "kgohocpz2p3u"
                            to: "zj1e5k5q2wrm"
                            quantity: "1.0000 CAT"
                            memo: "Transfer CAT 1"
                        }
                    }
                }
                redirectUrl: "http://localhost:3000/callbacksign"
                }
            ) {
                requestId
                headerLocation
            }
        }
    `,
    context: { 
        headers: {
            "Authorization": "Bearer cc6807b7998d5a744b5ea552481fb745f99e465c"
        }
    },
};

const requestSignTransaction = () => {
    return makePromise(execute(link, operation))
        .then(data => {
            return data.data.requestSignTransaction;
    })
        .catch(error => {
            console.log(`received data ${JSON.stringify(error, null, 2)}`)
            return "/"
        })
}
const signTransaction = () => {
    
}

exports.requestSignTransaction = requestSignTransaction;
exports.signTransaction = signTransaction;