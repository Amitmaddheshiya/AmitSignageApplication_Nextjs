
import Link from 'next/link';
export default function Page(){ return (<div style={{maxWidth:600,margin:'30px auto'}}>
  <h2>Admin Panel</h2>
  <ul>
    <li><a href='/admin/login'>Login</a></li>
    <li><a href='/admin/cms'>CMS</a></li>
    <li><a href='/admin/devices'>Devices (admin only)</a></li>
      <li><a href='/admin/users'>Users</a></li>\n  </ul>
</div>);}