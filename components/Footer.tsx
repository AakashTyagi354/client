
import Link from "next/link";
import { FaCode, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <strong className="block text-center text-xl font-bold text-gray-900 sm:text-3xl">
            Want us to email you with the latest blockbuster news?
          </strong>

          <form className="mt-6">
            <div className="relative max-w-lg">
              <label className="sr-only" htmlFor="email">
                {" "}
                Email{" "}
              </label>

              <input
                className="w-full rounded-full border-gray-200 bg-gray-100 p-4 pe-32 text-sm font-medium"
                id="email"
                type="email"
                placeholder="aakashtyagi354@gmail.com"
              />

              <button className="absolute end-1 top-1/2 -translate-y-1/2 rounded-full bg-[#78355B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#78355B] hover:opacity-95">
                Subscribe
              </button>
            </div>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-32">
          <div className="mx-auto max-w-sm lg:max-w-none">
            <p className="mt-4 text-center text-gray-500 lg:text-left lg:text-lg">
              Delma is your one-stop solution for online healthcare needs. From
              booking appointments with doctors to uploading lab test reports
              and purchasing medications, Delma offers a seamless experience for
              patients seeking quality healthcare services online.
            </p>

            <div className="mt-6 flex items-center justify-center gap-4 lg:justify-start">
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="https://www.linkedin.com/in/aakash-tyagi-274228206/"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only"> LinkedIn </span>

                <FaLinkedin size={25} />
              </a>

              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="https://github.com/AakashTyagi354"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only"> GitHub </span>

                <FaGithub size={25} />
              </a>

              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only"> Twitter </span>

               <FaTwitter size={25}/>
              </a>

              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="https://leetcode.com/Aakash_Tyagi"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only"> LeetCode </span>

                <FaCode size={25}/>
              </a>

             
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 text-center lg:grid-cols-3 lg:text-left">
            <div>
              <strong className="font-medium text-gray-900"> Services </strong>

              <ul className="mt-6 space-y-1">
                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    Find Doctors{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    Upload Documents
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    Apply as a doctor
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    Buy Medicines
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <strong className="font-medium text-gray-900"> About </strong>

              <ul className="mt-6 space-y-1">
                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    About{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    Careers{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    History{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    Our Team{" "}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <strong className="font-medium text-gray-900"> Support </strong>

              <ul className="mt-6 space-y-1">
                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    FAQs{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    Contact{" "}
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-700 transition hover:text-gray-700/75"
                    href="#"
                  >
                    {" "}
                    Live Chat{" "}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-8">
          <p className="text-center text-xs/relaxed text-gray-500">
            © aakashtyagi354 2024. All rights reserved.
            <br />
            Created with
            <a
              href="#"
              className="text-gray-700 mx-1 underline transition hover:text-gray-700/75"
            >
              Nextjs
            </a>
            and
            <a
              href="#"
              className="text-gray-700 ml-1 underline transition hover:text-gray-700/75"
            >
              MERN STACK
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
