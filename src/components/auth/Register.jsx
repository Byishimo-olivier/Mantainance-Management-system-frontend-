import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundVideo from '../../assets/136906-765457769_small.mp4';
import AuthHeader from './AuthHeader';

const initialForm = {
  firstName: '',
  lastName: '',
  countryIso: 'US',
  countryCode: '+1',
  phone: '',
  companyName: '',
  technicians: '',
  email: '',
  password: ''
};

const countryCallingCodes = [
  { name: 'Afghanistan', iso: 'AF', code: '+93' },
  { name: 'Albania', iso: 'AL', code: '+355' },
  { name: 'Algeria', iso: 'DZ', code: '+213' },
  { name: 'American Samoa', iso: 'AS', code: '+1-684' },
  { name: 'Andorra', iso: 'AD', code: '+376' },
  { name: 'Angola', iso: 'AO', code: '+244' },
  { name: 'Anguilla', iso: 'AI', code: '+1-264' },
  { name: 'Antarctica', iso: 'AQ', code: '+672' },
  { name: 'Antigua and Barbuda', iso: 'AG', code: '+1-268' },
  { name: 'Argentina', iso: 'AR', code: '+54' },
  { name: 'Armenia', iso: 'AM', code: '+374' },
  { name: 'Aruba', iso: 'AW', code: '+297' },
  { name: 'Australia', iso: 'AU', code: '+61' },
  { name: 'Austria', iso: 'AT', code: '+43' },
  { name: 'Azerbaijan', iso: 'AZ', code: '+994' },
  { name: 'Bahamas', iso: 'BS', code: '+1-242' },
  { name: 'Bahrain', iso: 'BH', code: '+973' },
  { name: 'Bangladesh', iso: 'BD', code: '+880' },
  { name: 'Barbados', iso: 'BB', code: '+1-246' },
  { name: 'Belarus', iso: 'BY', code: '+375' },
  { name: 'Belgium', iso: 'BE', code: '+32' },
  { name: 'Belize', iso: 'BZ', code: '+501' },
  { name: 'Benin', iso: 'BJ', code: '+229' },
  { name: 'Bermuda', iso: 'BM', code: '+1-441' },
  { name: 'Bhutan', iso: 'BT', code: '+975' },
  { name: 'Bolivia', iso: 'BO', code: '+591' },
  { name: 'Bosnia and Herzegovina', iso: 'BA', code: '+387' },
  { name: 'Botswana', iso: 'BW', code: '+267' },
  { name: 'Brazil', iso: 'BR', code: '+55' },
  { name: 'British Indian Ocean Territory', iso: 'IO', code: '+246' },
  { name: 'Brunei', iso: 'BN', code: '+673' },
  { name: 'Bulgaria', iso: 'BG', code: '+359' },
  { name: 'Burkina Faso', iso: 'BF', code: '+226' },
  { name: 'Burundi', iso: 'BI', code: '+257' },
  { name: 'Cambodia', iso: 'KH', code: '+855' },
  { name: 'Cameroon', iso: 'CM', code: '+237' },
  { name: 'Canada', iso: 'CA', code: '+1' },
  { name: 'Cape Verde', iso: 'CV', code: '+238' },
  { name: 'Cayman Islands', iso: 'KY', code: '+1-345' },
  { name: 'Central African Republic', iso: 'CF', code: '+236' },
  { name: 'Chad', iso: 'TD', code: '+235' },
  { name: 'Chile', iso: 'CL', code: '+56' },
  { name: 'China', iso: 'CN', code: '+86' },
  { name: 'Christmas Island', iso: 'CX', code: '+61' },
  { name: 'Cocos (Keeling) Islands', iso: 'CC', code: '+61' },
  { name: 'Colombia', iso: 'CO', code: '+57' },
  { name: 'Comoros', iso: 'KM', code: '+269' },
  { name: 'Congo (DRC)', iso: 'CD', code: '+243' },
  { name: 'Congo (Republic)', iso: 'CG', code: '+242' },
  { name: 'Cook Islands', iso: 'CK', code: '+682' },
  { name: 'Costa Rica', iso: 'CR', code: '+506' },
  { name: "Cote d'Ivoire", iso: 'CI', code: '+225' },
  { name: 'Croatia', iso: 'HR', code: '+385' },
  { name: 'Cuba', iso: 'CU', code: '+53' },
  { name: 'Curacao', iso: 'CW', code: '+599' },
  { name: 'Cyprus', iso: 'CY', code: '+357' },
  { name: 'Czechia', iso: 'CZ', code: '+420' },
  { name: 'Denmark', iso: 'DK', code: '+45' },
  { name: 'Djibouti', iso: 'DJ', code: '+253' },
  { name: 'Dominica', iso: 'DM', code: '+1-767' },
  { name: 'Dominican Republic', iso: 'DO', code: '+1-809' },
  { name: 'Ecuador', iso: 'EC', code: '+593' },
  { name: 'Egypt', iso: 'EG', code: '+20' },
  { name: 'El Salvador', iso: 'SV', code: '+503' },
  { name: 'Equatorial Guinea', iso: 'GQ', code: '+240' },
  { name: 'Eritrea', iso: 'ER', code: '+291' },
  { name: 'Estonia', iso: 'EE', code: '+372' },
  { name: 'Eswatini', iso: 'SZ', code: '+268' },
  { name: 'Ethiopia', iso: 'ET', code: '+251' },
  { name: 'Falkland Islands', iso: 'FK', code: '+500' },
  { name: 'Faroe Islands', iso: 'FO', code: '+298' },
  { name: 'Fiji', iso: 'FJ', code: '+679' },
  { name: 'Finland', iso: 'FI', code: '+358' },
  { name: 'France', iso: 'FR', code: '+33' },
  { name: 'French Guiana', iso: 'GF', code: '+594' },
  { name: 'French Polynesia', iso: 'PF', code: '+689' },
  { name: 'Gabon', iso: 'GA', code: '+241' },
  { name: 'Gambia', iso: 'GM', code: '+220' },
  { name: 'Georgia', iso: 'GE', code: '+995' },
  { name: 'Germany', iso: 'DE', code: '+49' },
  { name: 'Ghana', iso: 'GH', code: '+233' },
  { name: 'Gibraltar', iso: 'GI', code: '+350' },
  { name: 'Greece', iso: 'GR', code: '+30' },
  { name: 'Greenland', iso: 'GL', code: '+299' },
  { name: 'Grenada', iso: 'GD', code: '+1-473' },
  { name: 'Guadeloupe', iso: 'GP', code: '+590' },
  { name: 'Guam', iso: 'GU', code: '+1-671' },
  { name: 'Guatemala', iso: 'GT', code: '+502' },
  { name: 'Guernsey', iso: 'GG', code: '+44-1481' },
  { name: 'Guinea', iso: 'GN', code: '+224' },
  { name: 'Guinea-Bissau', iso: 'GW', code: '+245' },
  { name: 'Guyana', iso: 'GY', code: '+592' },
  { name: 'Haiti', iso: 'HT', code: '+509' },
  { name: 'Honduras', iso: 'HN', code: '+504' },
  { name: 'Hong Kong', iso: 'HK', code: '+852' },
  { name: 'Hungary', iso: 'HU', code: '+36' },
  { name: 'Iceland', iso: 'IS', code: '+354' },
  { name: 'India', iso: 'IN', code: '+91' },
  { name: 'Indonesia', iso: 'ID', code: '+62' },
  { name: 'Iran', iso: 'IR', code: '+98' },
  { name: 'Iraq', iso: 'IQ', code: '+964' },
  { name: 'Ireland', iso: 'IE', code: '+353' },
  { name: 'Isle of Man', iso: 'IM', code: '+44-1624' },
  { name: 'Israel', iso: 'IL', code: '+972' },
  { name: 'Italy', iso: 'IT', code: '+39' },
  { name: 'Jamaica', iso: 'JM', code: '+1-876' },
  { name: 'Japan', iso: 'JP', code: '+81' },
  { name: 'Jersey', iso: 'JE', code: '+44-1534' },
  { name: 'Jordan', iso: 'JO', code: '+962' },
  { name: 'Kazakhstan', iso: 'KZ', code: '+7' },
  { name: 'Kenya', iso: 'KE', code: '+254' },
  { name: 'Kiribati', iso: 'KI', code: '+686' },
  { name: 'Kosovo', iso: 'XK', code: '+383' },
  { name: 'Kuwait', iso: 'KW', code: '+965' },
  { name: 'Kyrgyzstan', iso: 'KG', code: '+996' },
  { name: 'Laos', iso: 'LA', code: '+856' },
  { name: 'Latvia', iso: 'LV', code: '+371' },
  { name: 'Lebanon', iso: 'LB', code: '+961' },
  { name: 'Lesotho', iso: 'LS', code: '+266' },
  { name: 'Liberia', iso: 'LR', code: '+231' },
  { name: 'Libya', iso: 'LY', code: '+218' },
  { name: 'Liechtenstein', iso: 'LI', code: '+423' },
  { name: 'Lithuania', iso: 'LT', code: '+370' },
  { name: 'Luxembourg', iso: 'LU', code: '+352' },
  { name: 'Macau', iso: 'MO', code: '+853' },
  { name: 'Madagascar', iso: 'MG', code: '+261' },
  { name: 'Malawi', iso: 'MW', code: '+265' },
  { name: 'Malaysia', iso: 'MY', code: '+60' },
  { name: 'Maldives', iso: 'MV', code: '+960' },
  { name: 'Mali', iso: 'ML', code: '+223' },
  { name: 'Malta', iso: 'MT', code: '+356' },
  { name: 'Marshall Islands', iso: 'MH', code: '+692' },
  { name: 'Martinique', iso: 'MQ', code: '+596' },
  { name: 'Mauritania', iso: 'MR', code: '+222' },
  { name: 'Mauritius', iso: 'MU', code: '+230' },
  { name: 'Mayotte', iso: 'YT', code: '+262' },
  { name: 'Mexico', iso: 'MX', code: '+52' },
  { name: 'Micronesia', iso: 'FM', code: '+691' },
  { name: 'Moldova', iso: 'MD', code: '+373' },
  { name: 'Monaco', iso: 'MC', code: '+377' },
  { name: 'Mongolia', iso: 'MN', code: '+976' },
  { name: 'Montenegro', iso: 'ME', code: '+382' },
  { name: 'Montserrat', iso: 'MS', code: '+1-664' },
  { name: 'Morocco', iso: 'MA', code: '+212' },
  { name: 'Mozambique', iso: 'MZ', code: '+258' },
  { name: 'Myanmar', iso: 'MM', code: '+95' },
  { name: 'Namibia', iso: 'NA', code: '+264' },
  { name: 'Nauru', iso: 'NR', code: '+674' },
  { name: 'Nepal', iso: 'NP', code: '+977' },
  { name: 'Netherlands', iso: 'NL', code: '+31' },
  { name: 'New Caledonia', iso: 'NC', code: '+687' },
  { name: 'New Zealand', iso: 'NZ', code: '+64' },
  { name: 'Nicaragua', iso: 'NI', code: '+505' },
  { name: 'Niger', iso: 'NE', code: '+227' },
  { name: 'Nigeria', iso: 'NG', code: '+234' },
  { name: 'Niue', iso: 'NU', code: '+683' },
  { name: 'Norfolk Island', iso: 'NF', code: '+672' },
  { name: 'North Korea', iso: 'KP', code: '+850' },
  { name: 'North Macedonia', iso: 'MK', code: '+389' },
  { name: 'Northern Mariana Islands', iso: 'MP', code: '+1-670' },
  { name: 'Norway', iso: 'NO', code: '+47' },
  { name: 'Oman', iso: 'OM', code: '+968' },
  { name: 'Pakistan', iso: 'PK', code: '+92' },
  { name: 'Palau', iso: 'PW', code: '+680' },
  { name: 'Palestine', iso: 'PS', code: '+970' },
  { name: 'Panama', iso: 'PA', code: '+507' },
  { name: 'Papua New Guinea', iso: 'PG', code: '+675' },
  { name: 'Paraguay', iso: 'PY', code: '+595' },
  { name: 'Peru', iso: 'PE', code: '+51' },
  { name: 'Philippines', iso: 'PH', code: '+63' },
  { name: 'Poland', iso: 'PL', code: '+48' },
  { name: 'Portugal', iso: 'PT', code: '+351' },
  { name: 'Puerto Rico', iso: 'PR', code: '+1-787' },
  { name: 'Qatar', iso: 'QA', code: '+974' },
  { name: 'Reunion', iso: 'RE', code: '+262' },
  { name: 'Romania', iso: 'RO', code: '+40' },
  { name: 'Russia', iso: 'RU', code: '+7' },
  { name: 'Rwanda', iso: 'RW', code: '+250' },
  { name: 'Saint Barthelemy', iso: 'BL', code: '+590' },
  { name: 'Saint Helena', iso: 'SH', code: '+290' },
  { name: 'Saint Kitts and Nevis', iso: 'KN', code: '+1-869' },
  { name: 'Saint Lucia', iso: 'LC', code: '+1-758' },
  { name: 'Saint Martin', iso: 'MF', code: '+590' },
  { name: 'Saint Pierre and Miquelon', iso: 'PM', code: '+508' },
  { name: 'Saint Vincent and the Grenadines', iso: 'VC', code: '+1-784' },
  { name: 'Samoa', iso: 'WS', code: '+685' },
  { name: 'San Marino', iso: 'SM', code: '+378' },
  { name: 'Sao Tome and Principe', iso: 'ST', code: '+239' },
  { name: 'Saudi Arabia', iso: 'SA', code: '+966' },
  { name: 'Senegal', iso: 'SN', code: '+221' },
  { name: 'Serbia', iso: 'RS', code: '+381' },
  { name: 'Seychelles', iso: 'SC', code: '+248' },
  { name: 'Sierra Leone', iso: 'SL', code: '+232' },
  { name: 'Singapore', iso: 'SG', code: '+65' },
  { name: 'Sint Maarten', iso: 'SX', code: '+1-721' },
  { name: 'Slovakia', iso: 'SK', code: '+421' },
  { name: 'Slovenia', iso: 'SI', code: '+386' },
  { name: 'Solomon Islands', iso: 'SB', code: '+677' },
  { name: 'Somalia', iso: 'SO', code: '+252' },
  { name: 'South Africa', iso: 'ZA', code: '+27' },
  { name: 'South Korea', iso: 'KR', code: '+82' },
  { name: 'South Sudan', iso: 'SS', code: '+211' },
  { name: 'Spain', iso: 'ES', code: '+34' },
  { name: 'Sri Lanka', iso: 'LK', code: '+94' },
  { name: 'Sudan', iso: 'SD', code: '+249' },
  { name: 'Suriname', iso: 'SR', code: '+597' },
  { name: 'Svalbard and Jan Mayen', iso: 'SJ', code: '+47' },
  { name: 'Sweden', iso: 'SE', code: '+46' },
  { name: 'Switzerland', iso: 'CH', code: '+41' },
  { name: 'Syria', iso: 'SY', code: '+963' },
  { name: 'Taiwan', iso: 'TW', code: '+886' },
  { name: 'Tajikistan', iso: 'TJ', code: '+992' },
  { name: 'Tanzania', iso: 'TZ', code: '+255' },
  { name: 'Thailand', iso: 'TH', code: '+66' },
  { name: 'Timor-Leste', iso: 'TL', code: '+670' },
  { name: 'Togo', iso: 'TG', code: '+228' },
  { name: 'Tokelau', iso: 'TK', code: '+690' },
  { name: 'Tonga', iso: 'TO', code: '+676' },
  { name: 'Trinidad and Tobago', iso: 'TT', code: '+1-868' },
  { name: 'Tunisia', iso: 'TN', code: '+216' },
  { name: 'Turkey', iso: 'TR', code: '+90' },
  { name: 'Turkmenistan', iso: 'TM', code: '+993' },
  { name: 'Turks and Caicos Islands', iso: 'TC', code: '+1-649' },
  { name: 'Tuvalu', iso: 'TV', code: '+688' },
  { name: 'Uganda', iso: 'UG', code: '+256' },
  { name: 'Ukraine', iso: 'UA', code: '+380' },
  { name: 'United Arab Emirates', iso: 'AE', code: '+971' },
  { name: 'United Kingdom', iso: 'GB', code: '+44' },
  { name: 'United States', iso: 'US', code: '+1' },
  { name: 'Uruguay', iso: 'UY', code: '+598' },
  { name: 'Uzbekistan', iso: 'UZ', code: '+998' },
  { name: 'Vanuatu', iso: 'VU', code: '+678' },
  { name: 'Vatican City', iso: 'VA', code: '+379' },
  { name: 'Venezuela', iso: 'VE', code: '+58' },
  { name: 'Vietnam', iso: 'VN', code: '+84' },
  { name: 'Virgin Islands, British', iso: 'VG', code: '+1-284' },
  { name: 'Virgin Islands, U.S.', iso: 'VI', code: '+1-340' },
  { name: 'Wallis and Futuna', iso: 'WF', code: '+681' },
  { name: 'Western Sahara', iso: 'EH', code: '+212' },
  { name: 'Yemen', iso: 'YE', code: '+967' },
  { name: 'Zambia', iso: 'ZM', code: '+260' },
  { name: 'Zimbabwe', iso: 'ZW', code: '+263' }
];

const getFlagEmoji = (isoCode) => {
  if (!isoCode || isoCode.length !== 2) return '';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isSubmitDisabled = isSubmitting || !form.firstName || !form.lastName || !form.phone || !form.companyName || !form.technicians || !form.email || !form.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'countryIso') {
      const selected = countryCallingCodes.find((country) => country.iso === value);
      setForm((prev) => ({
        ...prev,
        countryIso: value,
        countryCode: selected ? selected.code : prev.countryCode
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const phoneValue = `${form.countryCode}${form.phone}`.replace(/[^+\d]/g, '');

    const payload = {
      name: fullName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      countryCode: form.countryCode,
      phone: phoneValue,
      email: form.email.trim(),
      password: form.password,
      role: 'CLIENT',
      companyName: form.companyName.trim(),
      techniciansCount: form.technicians || undefined
    };

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setForm(initialForm);
        navigate('/login', { replace: true });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--stack auth-shell--with-header">
      <AuthHeader />
      <div className="video-background-container">
        <video autoPlay loop muted playsInline className="video-background">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>
      <div className="auth-stack">
        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Sign Up For Free</h1>
            <p className="auth-subtitle">Start organizing maintenance with a faster, clearer workflow.</p>
          </div>

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="firstName" className="auth-label">First Name*</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                autoComplete="given-name"
                required
                className="auth-input"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="lastName" className="auth-label">Last Name*</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                autoComplete="family-name"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
          <label htmlFor="phone" className="auth-label">Mobile Number*</label>
          <div className="auth-input-group auth-input-group--phone">
            <div className="auth-country">
              <span className="auth-flag" aria-hidden="true">{getFlagEmoji(form.countryIso)}</span>
              <select
                id="countryIso"
                name="countryIso"
                value={form.countryIso}
                onChange={handleChange}
                className="auth-select"
                aria-label="Country"
              >
                {countryCallingCodes.map((country) => (
                  <option key={`${country.iso}-${country.code}`} value={country.iso}>
                    {country.name} {country.code}
                  </option>
                ))}
              </select>
            </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                autoComplete="tel"
                inputMode="tel"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="companyName" className="auth-label">Company Name*</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              autoComplete="organization"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="technicians" className="auth-label">Number of Technicians*</label>
              <span className="auth-info" aria-label="Used for sizing recommendations">i</span>
            </div>
            <select
              id="technicians"
              name="technicians"
              value={form.technicians}
              onChange={handleChange}
              required
              className="auth-input auth-select-input"
            >
              <option value="" disabled>Select the number of technicians</option>
              <option value="1-5">1-5</option>
              <option value="6-10">6-10</option>
              <option value="11-25">11-25</option>
              <option value="26-50">26-50</option>
              <option value="51-100">51-100</option>
              <option value="100+">100+</option>
            </select>
          </div>

          <div className="auth-divider" />

          <div className="auth-section-title">Sign Up</div>

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email*</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your business email address"
              autoComplete="email"
              required
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password*</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create Password"
              autoComplete="new-password"
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? 'Creating account...' : 'Start a Free Trial'}
          </button>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-helper auth-center">
            Not Ready Yet? <span className="auth-link">Schedule a tour</span>
          </div>
          <div className="auth-note auth-center">No Credit Card Required.</div>
          <div className="auth-legal auth-center">
            By clicking above, you agree to the <span className="auth-link">Fixnest Terms of Use</span>.
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </div>
        </form>

        <section className="auth-features">
          <div className="auth-features-header">
            <h2 className="auth-features-title">Make Your Management Easy with these Features</h2>
          </div>
          <div className="auth-features-grid">
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">WR</div>
              <h3 className="feature-title">Work Requests</h3>
              <p className="feature-text">Create, manage, and update work orders for repairs and PMs.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">PM</div>
              <h3 className="feature-title">Preventive Maintenance</h3>
              <p className="feature-text">Schedule and manage preventive maintenance from a calendar view.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">CL</div>
              <h3 className="feature-title">Maintenance Checklists</h3>
              <p className="feature-text">Create customized checklists for inspections, routine calibrations, and more.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">MB</div>
              <h3 className="feature-title">Mobile CMMS</h3>
              <p className="feature-text">Update work orders and submit requests out in the field from your mobile device.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">DT</div>
              <h3 className="feature-title">Downtime Tracking</h3>
              <p className="feature-text">View historical downtime and log new downtime for your assets.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">TC</div>
              <h3 className="feature-title">Time and Cost Tracking</h3>
              <p className="feature-text">Track wrench time and maintenance costs within work orders for insight into productivity and expenses.</p>
            </article>
          </div>
        </section>

        <section className="auth-tutorial">
          <div className="auth-tutorial-header">
            <h2 className="auth-features-title">Quick Tutorial: How to Use Fixnest</h2>
            <p className="auth-tutorial-subtitle">A simple guided flow to get your team working fast.</p>
          </div>
          <div className="auth-tutorial-grid">
            <article className="tutorial-card">
              <div className="tutorial-step">1</div>
              <h3 className="tutorial-title">Add Properties & Assets</h3>
              <p className="tutorial-text">Create properties, upload asset details, and tag equipment by location.</p>
            </article>
            <article className="tutorial-card">
              <div className="tutorial-step">2</div>
              <h3 className="tutorial-title">Create Work Orders</h3>
              <p className="tutorial-text">Open work requests, set priorities, and assign technicians instantly.</p>
            </article>
            <article className="tutorial-card">
              <div className="tutorial-step">3</div>
              <h3 className="tutorial-title">Schedule PMs</h3>
              <p className="tutorial-text">Plan preventive maintenance, attach checklists, and track completion.</p>
            </article>
            <article className="tutorial-card">
              <div className="tutorial-step">4</div>
              <h3 className="tutorial-title">Track Costs & Reports</h3>
              <p className="tutorial-text">Capture time, parts, and costs to generate clear performance insights.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
