import { navigate } from "svelte-routing";

let TOKEN = "";

export function Post(url,data) {
	return fetch(url,{
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-access-token": "eavesmy",
			"token": TOKEN,
		},
		credentials: "include",
		body: JSON.stringify(data),
	}).then(res => {
		
		if(res.status !== 200) {
			navigate("/login",{replace:true});
			return
		}

		let token = res.headers.get("token");
		TOKEN = token;
		return res.json();
	});
}
