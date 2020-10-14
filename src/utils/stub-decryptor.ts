/**
 * This is a file that can be required by apps that don't have access to the axisnow decryptor
 */

throw new Error(
  "This application mistakenly required the AxisNow Decryptor, when it does not have access"
);

export default {};
