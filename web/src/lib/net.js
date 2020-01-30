export function Post(url,data) {
	return fetch(url,{
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-access-token": "123"
		},
		body: JSON.stringify(data)
	}).then(res => res.json());
}

export function Get(url) {
	return fetch(url,{
		headers: {
			"x-access-token": "123"
		}
	}).then(res => res.json());
}
