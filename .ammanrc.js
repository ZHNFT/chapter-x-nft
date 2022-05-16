const { LOCALHOST, tmpLedgerDir } = require('@metaplex-foundation/amman');
const path = require('path');
const mplCandyMachine = require('@metaplex-foundation/mpl-candy-machine');
const mplTokenMetadata = require('@metaplex-foundation/mpl-token-metadata');

function localDeployPath(programName) {
    return path.join(__dirname, 'amman_programs', `${programName}.so`);
}

const accountProviders = {
    CandyMachine: mplCandyMachine.CandyMachine,
    CollectionPDA: mplCandyMachine.CollectionPDA,
    CollectionAuthorityRecord: mplTokenMetadata.CollectionAuthorityRecord,
    Edition: mplTokenMetadata.Edition,
    EditionMarker: mplTokenMetadata.EditionMarker,
    MasterEditionV2: mplTokenMetadata.MasterEditionV2,
    Metadata: mplTokenMetadata.Metadata,
    ReservationListV2: mplTokenMetadata.ReservationListV2,
    UseAuthorityRecord: mplTokenMetadata.UseAuthorityRecord
};

const programIds = {
    metadata: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    vault: 'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn',
    auction: 'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
    metaplex: 'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98',
    fixedPriceSaleToken: 'SaLeTjyUa5wXHnGuewUSyJ5JWZaHwz3TxqUntCE9czo',
    candyMachine: 'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
};

const programs = [
    {
        label: 'Token Metadata',
        programId: programIds.metadata,
        deployPath: localDeployPath('mpl_token_metadata'),
    },
    {
        label: 'Candy Machine',
        programId: programIds.candyMachine,
        deployPath: localDeployPath('mpl_candy_machine'),
    },
];

module.exports = {
    validator: {
        killRunningValidators: true,
        programs: programs,
        jsonRpcUrl: LOCALHOST,
        websocketUrl: '',
        commitment: 'confirmed',
        ledgerDir: tmpLedgerDir(),
        resetLedger: true,
        verifyFees: false,
    }
};
