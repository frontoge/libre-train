import { useContext } from 'react';
import { AppContext } from '../app-context';

export const useMessage = () => {
	const {
		state: { showMessage },
	} = useContext(AppContext);
	return showMessage;
};
