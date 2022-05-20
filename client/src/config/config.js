import abi from '../utils/EpicGame.json';
import dotenv from 'dotenv';
dotenv.config();

const contractAddress = '0x11585Fd41ce2A7A95268D754F343D506ce315884';
const contractABI = abi.abi;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	contractAddress,
	contractABI,
}
