"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import styles from "../styles/Footer.module.css";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.newsletterSection} ${styles.flexSection}`}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.titleArea}>
              <h4 className={styles.title}>
                Do you love Eternity Ready?
                <br />
                Sign up for updates!
              </h4>
            </div>
            <div className={styles.formArea}>
              <form className={styles.newsletterForm}>
                <input
                  type="email"
                  name="EMAIL"
                  placeholder="Your email address"
                  required=""
                />
                <input type="submit" value="Sign up" />
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.topWrapper}>
        <div className={styles.container}>
          <div className={styles.socialSection}>
            <h2 className={styles.mainTitle}>Connect with us</h2>
            <div className={styles.socialLinks}>
              <div className={`${styles.row} ${styles.firstRow}`}>
                <div className={styles.facebookBtn}>
                  <a
                    className={styles.socialBtn}
                    href="https://www.facebook.com/eternityready"
                    target="_blank"
                  >
                    <FaFacebookF />
                    Facebook
                  </a>
                </div>
                <div className={styles.twitterBtn}>
                  <a
                    className={styles.socialBtn}
                    href="https://twitter.com/eternityready"
                    target="_blank"
                  >
                    <FaXTwitter />
                    Twitter
                  </a>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.youtubeBtn}>
                  <a className={styles.socialBtn} href="#" target="_blank">
                    <FaYoutube />
                    Youtube
                  </a>
                </div>
                <div className={styles.instagramBtn}>
                  <a className={styles.socialBtn} href="#" target="_blank">
                    <FaInstagram />
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.midWrapper}>
            <div className={styles.container}>
              <div className={`${styles.menuWrap} ${styles.appWrap}`}>
                <h4 className={styles.title}>Our Apps</h4>
                <a
                  className={styles.appImg}
                  href="https://play.google.com/store/apps/details?id=com.wRaptureReadyEndTimesNewsProphecyDoctrineofPreTribRapture"
                  target="_blank"
                >
                  <Image
                    src="/play-store-icon.png"
                    width={150}
                    height={50}
                    alt="Play Store Icon"
                  />
                </a>
                <a
                  className={styles.appImg}
                  href="https://apps.apple.com/us/app/rapture-ready/id6504677632"
                  target="_blank"
                >
                  <Image
                    src="/app-store-icon.png"
                    width={150}
                    height={50}
                    alt="App Store Icon"
                  />
                </a>
              </div>
              <div className={`${styles.row} ${styles.firstRow}`}>
                <div className={styles.menuWrap}>
                  <h4 className={styles.title}>Useful Links</h4>
                  <nav className={styles.footerMenu}>
                    <ul>
                      <li>
                        <a href="#">Radio Schedule</a>
                      </li>
                      <li>
                        <a href="#">Ways to Listen</a>
                      </li>
                      <li>
                        <a href="https://donorbox.org/eternity-ready-radio">
                          Donate
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className={styles.menuWrap}>
                  <nav className={styles.footerMenu}>
                    <h4 className={styles.title}>Our Brands</h4>
                    <ul>
                      <li>
                        <a href="https://www.eternityready.com">Corporate</a>
                      </li>
                      <li>
                        <a href="http://www.eternityready.tv">
                          Eternity Ready TV
                        </a>
                      </li>
                      <li>
                        <a href="http://www.raptureready.tv">
                          Rapture Ready TV
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.menuWrap}>
                  <nav className={styles.footerMenu}>
                    <h4 className={styles.title}>About</h4>
                    <ul>
                      <li>
                        <a href="#">Team &amp; Culture</a>
                      </li>
                      <li>
                        <a href="#">About Us</a>
                      </li>
                      <li>
                        <a href="https://www.eternityready.com/EternityReadyMedia.pdf">
                          Our Media Kit
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className={styles.menuWrap}>
                  <nav className={styles.footerMenu}>
                    <h4 className={styles.title}>Help</h4>
                    <ul>
                      <li>
                        <a href="https://eternityreadyradio.com/page.php?p=1">
                          Terms of use
                        </a>
                      </li>
                      <li>
                        <a href="#">Privacy &amp; Legal</a>
                      </li>
                      <li>
                        <a href="https://help.eternityready.com/">
                          Contact &amp; Help
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.logoArea}>
              <Image
                src="/eternity-logo.png"
                width={150}
                height={50}
                alt="Eternity Ready Logo"
              />
            </div>
            <div className={styles.copyright}>
              <p>© 2012-2024 Eternity Ready LLC, All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
