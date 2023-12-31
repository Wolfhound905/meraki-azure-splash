import { PRIVATE_JWT_SECRET } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

//jsrsasign
import { KJUR } from 'jsrsasign';

export const GET: RequestHandler = ({ url }) => {
	const { searchParams } = new URL(url);
	const loginUrl = searchParams.get('login_url');
	const continueUrl = searchParams.get('continue_url');
	const apMac = searchParams.get('ap_mac');
	const apName = searchParams.get('ap_name');
	const apTags = searchParams.get('ap_tags');
	const clientMac = searchParams.get('client_mac');
	const clientIp = searchParams.get('client_ip');

	if (!loginUrl || !continueUrl) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/error/unknown'
			}
		});
	}

	const payload = {
		loginUrl,
		continueUrl,
		apMac,
		apName,
		apTags,
		clientMac,
		clientIp
	};

	const token = KJUR.jws.JWS.sign(
		'HS256',
		JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
		JSON.stringify(payload),
		PRIVATE_JWT_SECRET
	);

	const html = `
		<html>
		<body>
			You are being <a href="/splash">redirected</a>.
		</body>
		</html>
	`;

	return new Response(html, {
		status: 302,
		headers: {
			Location: '/splash',
			'Set-Cookie': `splash=${token}; Path=/; Secure; SameSite=None; HttpOnly; Max-Age=3600`,
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
};
