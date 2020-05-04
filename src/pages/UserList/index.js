import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ThemeContext } from 'styled-components';
import { FiSearch } from 'react-icons/fi';

import api from '../../services/api';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';

import { Container, Search, Table } from './styles';

function UserList() {
	const theme = useContext(ThemeContext);
	const history = useHistory();
	const query = new URLSearchParams(history.location.search);

	const [params, setParams] = useState({
		firstName: query.get('first') || '',
		currentPage: parseInt(query.get('page')) || 1
	});
	const [data, setData] = useState({
		loading: true,
		users: {
			pages: 1,
			[params.currentPage]: []
		}
	});

	document.title = 'Usuários da aplicação';

	useEffect(() => {
		async function search() {
			setData((oldData) => ({
				loading: true,
				users: {
					...oldData.users,
					pages: 1
				}
			}));

			const query = new URLSearchParams(history.location.search);

			query.set('first', params.firstName);
			query.set('page', params.currentPage);

			history.location.search = query.toString();
			history.push(history.location);

			try {
				const response = await api.get('users', {
					params: {
						first: params.firstName,
						page: params.currentPage
					}
				});

				const totalUsers = response.headers['x-total-count'];
				const pages = parseInt(totalUsers / 10 + ((totalUsers % 10) ? 1 : 0));

				setData((oldData) => ({
					loading: false,
					users: {
						...oldData.users,
						[params.currentPage]: response.data,
						pages
					}
				}));
			} catch (err) {
				setData((oldData) => ({
					...oldData,
					loading: false,
				}));

				const status = err.response?.status;

				if (status === 401) history.push('/');
			}
		}
		search();
	}, [history, params]);

	function handleSubmit(formData) {
		setParams({
			...formData,
			currentPage: 1
		})
	}

	return (
		<Container>
			<Header />
			<section>
				<Search onSubmit={handleSubmit}>
					<Input type="text" name="firstName" placeholder="Pesquisar nome" />
					<button type="submit">
						<FiSearch
							size={32}
							stroke={theme.colors.secondary}
							style={{ verticalAlign: 'middle' }}
						/>
					</button>
				</Search>
				<div>
					<Table>
						<thead>
							<tr>
								<th>Nome</th>
								<th>Usuário</th>
								<th>Data de criação</th>
							</tr>
						</thead>
						<tbody>
							{data.users[params.currentPage] &&
							data.users[params.currentPage].map((user) => (
								<tr key={user.id} >
									<td>{user.firstName}</td>
									<td>{user.username}</td>
									<td>{user.createdAt}</td>
								</tr>
							))}
						</tbody>
					</Table>
					<Pagination
						pages={data.users.pages}
						currentPage={params.currentPage}
						onPageChange={(newPage) => setParams((oldParams) => ({
							...oldParams,
							currentPage: newPage
						}))}
					/>
				</div>
			</section>
			<Footer />
		</Container>
	);
}

export default UserList;
