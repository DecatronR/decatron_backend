const Contract = require("../../models/Contract");

const updateContractStatus = async (contractId, status) => {
  const contract = await Contract.findById(contractId);
  if (contract) {
    contract.status = status;
    await contract.save();
    console.log(`Contract ${contract._id} status updated to ${status}.`);
  } else {
    console.warn(`Contract ${contractId} not found.`);
  }
};

module.exports = updateContractStatus;
